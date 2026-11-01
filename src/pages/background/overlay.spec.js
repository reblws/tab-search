import sinon from 'sinon';
import { createStore } from 'redux';
import { createOverlayLauncher } from './overlay.js';

const POPUP = 'popup/index.html';
const SET = 'SET_OVERLAY';
const reducer = (state = { general: { enableOverlay: false } }, action) => (action.type === SET
  ? { general: { enableOverlay: action.value } }
  : state);
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const webTab = { id: 5, windowId: 2, url: 'https://example.com/' };

describe('overlay launcher', function () {
  let action;
  let store;

  beforeEach(function () {
    action = {
      setPopup: sinon.stub().resolves(),
      openPopup: sinon.stub().resolves(),
      onClicked: { addListener: sinon.spy() },
    };
    browser.browserAction = action;
    browser.runtime.id = 'ext';
    browser.runtime.getURL = path => `moz-extension://ext/${path}`;
    browser.runtime.onMessage = { addListener: sinon.spy() };
    browser.windows.get = sinon.stub().resolves({ left: 0, top: 0, width: 1200, height: 900 });
    browser.windows.create = sinon.stub().resolves({ id: 9 });
  });

  function launch({ on = false, name = 'firefox', inject = sinon.stub().resolves() } = {}) {
    store = createStore(reducer);
    if (on) store.dispatch({ type: SET, value: true });
    const launcher = createOverlayLauncher({ store, rehydrated: Promise.resolve(), name, inject });
    return Object.assign(launcher, { inject });
  }

  describe('the setting', function () {
    it('should take the popup off the button while it is on', async function () {
      await launch({ on: true }).ready;
      expect(action.setPopup.calledOnceWith({ popup: '' })).to.equal(true);
    });

    it('should leave the button alone while it is off', async function () {
      await launch().ready;
      expect(action.setPopup.called).to.equal(false);
    });

    it('should follow changes to it', async function () {
      await launch().ready;
      store.dispatch({ type: SET, value: true });
      store.dispatch({ type: 'OTHER' });
      store.dispatch({ type: SET, value: false });
      expect(action.setPopup.args.map(([arg]) => arg.popup)).to.deep.equal(['', POPUP]);
    });
  });

  it('should inject the host script into an ordinary page', async function () {
    const launcher = launch({ on: true });
    await launcher.ready;
    await launcher.openOverlay(webTab);
    expect(launcher.inject.calledOnceWith(5)).to.equal(true);
    expect(action.openPopup.called).to.equal(false);
  });

  it('should open the toolbar popup on the browser\'s own pages, before any await', async function () {
    const launcher = launch({ on: true });
    await launcher.ready;
    action.setPopup.resetHistory();
    const opening = launcher.openOverlay({ id: 5, windowId: 2, url: 'about:newtab' });
    // Firefox's user action ends at the first await: both calls go out now
    expect(action.setPopup.calledOnceWith({ popup: POPUP })).to.equal(true);
    expect(action.openPopup.calledOnce).to.equal(true);
    await opening;
    expect(launcher.inject.called).to.equal(false);
    // and the button goes back to the overlay
    expect(action.setPopup.lastCall.args[0]).to.deep.equal({ popup: '' });
  });

  it('should fall back to the toolbar popup when injecting fails', async function () {
    const launcher = launch({ on: true, inject: sinon.stub().rejects(new Error('Missing host permission')) });
    await launcher.ready;
    await launcher.openOverlay(webTab);
    expect(action.openPopup.calledOnce).to.equal(true);
  });

  it('should open a window where the browser won\'t open the toolbar popup', async function () {
    action.openPopup.rejects(new Error('openPopup requires a user gesture'));
    const launcher = launch({ on: true });
    await launcher.ready;
    await launcher.openOverlay({ id: 5, windowId: 2, url: 'chrome://newtab/' });
    await flush();
    expect(browser.windows.create.calledOnce).to.equal(true);
    const [options] = browser.windows.create.firstCall.args;
    expect(options).to.include({
      url: 'moz-extension://ext/popup/index.html?surface=window&from=2',
      type: 'popup',
      left: 300,
      top: 113,
    });
    expect(action.setPopup.lastCall.args[0]).to.deep.equal({ popup: '' });
  });

  it('should fall back when the host script reports a frame that never loaded', async function () {
    const launcher = launch({ on: true });
    await launcher.ready;
    launcher.addListeners();
    const [onMessage] = browser.runtime.onMessage.addListener.firstCall.args;
    onMessage({ type: 'tabsearch/overlay-failed' }, { id: 'other', tab: webTab });
    expect(action.openPopup.called).to.equal(false);
    onMessage({ type: 'tabsearch/overlay-failed' }, { id: 'ext', tab: webTab });
    expect(action.openPopup.calledOnce).to.equal(true);
  });

  describe('frame tokens', function () {
    const token = 'a1b2c3d4-e5f6-4789-abcd-0123456789ab';
    const page = { id: 'ext', url: 'https://example.com/', tab: webTab };
    const frame = { id: 'ext', url: 'moz-extension://ext/popup/index.html?surface=overlay#x', tab: webTab };
    let onMessage;

    beforeEach(async function () {
      const launcher = launch({ on: true });
      await launcher.ready;
      launcher.addListeners();
      [onMessage] = browser.runtime.onMessage.addListener.firstCall.args;
    });

    const claim = (sender = frame) => onMessage({ type: 'tabsearch/overlay-claim', token }, sender);

    it('should let the frame start once, with the token its host registered', async function () {
      expect(await onMessage({ type: 'tabsearch/overlay-register', token }, page)).to.equal(true);
      expect(await claim()).to.deep.equal({ valid: true });
      expect(await claim()).to.deep.equal({ valid: false });
    });

    it('should not take a token from the frame or a claim from the page', async function () {
      expect(onMessage({ type: 'tabsearch/overlay-register', token }, frame)).to.equal(undefined);
      expect(await claim()).to.deep.equal({ valid: false });
      await onMessage({ type: 'tabsearch/overlay-register', token }, page);
      expect(onMessage({ type: 'tabsearch/overlay-claim', token }, page)).to.equal(undefined);
    });

    it('should not let a frame in another tab use the token', async function () {
      await onMessage({ type: 'tabsearch/overlay-register', token }, page);
      expect(await claim(Object.assign({}, frame, { tab: { id: 6, windowId: 2 } })))
        .to.deep.equal({ valid: false });
    });
  });

  it('should open the overlay when the button is clicked', async function () {
    const launcher = launch({ on: true });
    await launcher.ready;
    launcher.addListeners();
    const [onClick] = action.onClicked.addListener.firstCall.args;
    await onClick(webTab);
    expect(launcher.inject.calledOnceWith(5)).to.equal(true);
  });
});
