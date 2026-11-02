import sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { mountOverlay, HOST_TAG } from './host.js';
import {
  OVERLAY_ALIVE, OVERLAY_READY, OVERLAY_CLOSE, OVERLAY_DISMISS,
} from 'core/overlay/protocol.js';

const ORIGIN = 'moz-extension://abc';
const SRC = `${ORIGIN}/popup/index.html?surface=overlay`;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('overlay host', function () {
  let dom;
  let win;
  let doc;

  beforeEach(function () {
    dom = new JSDOM('<!DOCTYPE html><body><input id="page-input"></body>');
    win = dom.window;
    doc = win.document;
  });

  afterEach(function () {
    win.close();
  });

  // jsdom gives a frame in a shadow root no window, so each gets a stand-in
  function mount(options = {}) {
    const overlay = mountOverlay(Object.assign({ src: SRC, origin: ORIGIN, doc, win }, options));
    const frameWindow = { postMessage: sinon.spy() };
    Object.defineProperty(overlay.frame, 'contentWindow', { value: frameWindow, configurable: true });
    return overlay;
  }

  function message(data, origin, source) {
    const event = new win.Event('message');
    Object.defineProperties(event, {
      data: { value: data },
      origin: { value: origin },
      source: { value: source },
    });
    win.dispatchEvent(event);
  }

  function fromFrame(overlay, type, origin = ORIGIN) {
    message({ type }, origin, overlay.frame.contentWindow);
  }

  it('should lay a hidden host with the frame over the page', function () {
    const overlay = mount();
    const host = doc.querySelector(HOST_TAG);
    expect(host).to.equal(overlay.host);
    expect(host.parentNode).to.equal(doc.documentElement);
    expect(host.style.getPropertyValue('position')).to.equal('fixed');
    expect(host.style.getPropertyPriority('position')).to.equal('important');
    expect(host.style.getPropertyValue('opacity')).to.equal('0');
    const frame = host.shadowRoot.querySelector('iframe');
    expect(frame.src).to.equal(SRC);
    expect(frame.style.getPropertyValue('color-scheme')).to.equal('light dark');
    overlay.close();
  });

  it('should stay hidden while the frame draws, and show once it has', function () {
    const overlay = mount();
    fromFrame(overlay, OVERLAY_ALIVE);
    expect(overlay.host.style.getPropertyValue('opacity')).to.equal('0');
    fromFrame(overlay, OVERLAY_READY);
    expect(overlay.host.style.getPropertyValue('opacity')).to.equal('1');
    overlay.close();
  });

  it('should hand the frame the focus if the page still has it', function () {
    const overlay = mount();
    const focus = sinon.spy(overlay.frame, 'focus');
    fromFrame(overlay, OVERLAY_READY);
    expect(focus.calledOnce).to.equal(true);
    overlay.close();
  });

  it('should leave the focus alone when the frame has it already', function () {
    const overlay = mount();
    const focus = sinon.spy(overlay.frame, 'focus');
    Object.defineProperty(doc, 'activeElement', { value: overlay.host, configurable: true });
    fromFrame(overlay, OVERLAY_READY);
    expect(focus.called).to.equal(false);
    delete doc.activeElement;
    overlay.close();
  });

  it('should only listen to its own frame from the extension origin', function () {
    const onClosed = sinon.spy();
    const overlay = mount({ onClosed });
    fromFrame(overlay, OVERLAY_CLOSE, 'https://evil.example');
    message({ type: OVERLAY_CLOSE }, ORIGIN, win);
    message({ type: OVERLAY_CLOSE }, ORIGIN, null);
    expect(onClosed.called).to.equal(false);
    expect(doc.querySelector(HOST_TAG)).to.not.equal(null);
    fromFrame(overlay, OVERLAY_CLOSE);
    expect(onClosed.calledOnce).to.equal(true);
    expect(doc.querySelector(HOST_TAG)).to.equal(null);
  });

  it('should give the focus back to what the page had focused', function () {
    const input = doc.getElementById('page-input');
    input.focus();
    const overlay = mount();
    overlay.host.setAttribute('tabindex', '-1');
    overlay.host.focus();
    fromFrame(overlay, OVERLAY_CLOSE);
    expect(doc.activeElement).to.equal(input);
  });

  it('should give up and report it when the frame never says it is ready', async function () {
    const onFailed = sinon.spy();
    mount({ onFailed, readyTimeoutMs: 5 });
    await wait(30);
    expect(onFailed.calledOnce).to.equal(true);
    expect(doc.querySelector(HOST_TAG)).to.equal(null);
  });

  it('should wait longer for a frame that is alive to draw', async function () {
    const onFailed = sinon.spy();
    const overlay = mount({ onFailed, readyTimeoutMs: 5, drawTimeoutMs: 60 });
    fromFrame(overlay, OVERLAY_ALIVE);
    await wait(30);
    expect(onFailed.called).to.equal(false);
    fromFrame(overlay, OVERLAY_READY);
    await wait(60);
    expect(onFailed.called).to.equal(false);
    overlay.close();
  });

  it('should give up on a live frame that never draws', async function () {
    const onFailed = sinon.spy();
    const overlay = mount({ onFailed, readyTimeoutMs: 5, drawTimeoutMs: 20 });
    fromFrame(overlay, OVERLAY_ALIVE);
    await wait(60);
    expect(onFailed.calledOnce).to.equal(true);
    expect(doc.querySelector(HOST_TAG)).to.equal(null);
  });

  it('should close when the tab is hidden', function () {
    mount();
    Object.defineProperty(doc, 'visibilityState', { value: 'hidden', configurable: true });
    doc.dispatchEvent(new win.Event('visibilitychange'));
    expect(doc.querySelector(HOST_TAG)).to.equal(null);
  });

  it('should close on Escape if the page took the focus', function () {
    mount();
    doc.getElementById('page-input').dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(doc.querySelector(HOST_TAG)).to.equal(null);
  });

  it('should hide the focus moving into it from the page\'s focus traps', function () {
    const trap = sinon.spy();
    doc.addEventListener('focusin', trap, true);
    const overlay = mount();
    overlay.host.dispatchEvent(new win.FocusEvent('focusin', { bubbles: true }));
    expect(trap.called).to.equal(false);
    doc.getElementById('page-input').dispatchEvent(new win.FocusEvent('focusin', { bubbles: true }));
    expect(trap.calledOnce).to.equal(true);
    overlay.close();
  });

  it('should mount inside a fullscreen element', function () {
    const stage = doc.createElement('div');
    doc.body.append(stage);
    Object.defineProperty(doc, 'fullscreenElement', { value: stage, configurable: true });
    const overlay = mount();
    expect(overlay.host.parentNode).to.equal(stage);
    overlay.close();
  });

  it('should ask the frame to animate out, then close anyway', async function () {
    const overlay = mount();
    const post = overlay.frame.contentWindow.postMessage;
    overlay.dismiss();
    expect(post.calledWith({ type: OVERLAY_DISMISS }, ORIGIN)).to.equal(true);
    expect(doc.querySelector(HOST_TAG)).to.not.equal(null);
    await wait(450);
    expect(doc.querySelector(HOST_TAG)).to.equal(null);
  });

  it('should remove its listeners when it closes', function () {
    const onClosed = sinon.spy();
    const overlay = mount({ onClosed });
    overlay.close();
    overlay.close();
    fromFrame(overlay, OVERLAY_CLOSE);
    expect(onClosed.calledOnce).to.equal(true);
  });
});
