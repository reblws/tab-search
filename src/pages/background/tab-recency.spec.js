import sinon from 'sinon';
import { GET_FOCUSED_AT } from 'core/tabs/recency.js';
import { addTabRecencyListeners } from './tab-recency.js';

describe('addTabRecencyListeners', function () {
  let clock;
  let listeners;
  let record;

  const event = name => ({ addListener: (fn) => { listeners[name] = fn; } });

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: 1000, toFake: ['setTimeout', 'Date'] });
    listeners = {};
    Object.assign(browser, {
      tabs: Object.assign(browser.tabs, {
        onActivated: event('activated'),
        onRemoved: event('removed'),
      }),
      windows: Object.assign(browser.windows, {
        WINDOW_ID_NONE: -1,
        get: sinon.stub().resolves({ focused: true }),
        onFocusChanged: event('focusChanged'),
      }),
      runtime: Object.assign(browser.runtime, { onMessage: event('message') }),
    });
    record = {
      touch: sinon.stub().resolves(),
      forget: sinon.stub().resolves(),
      all: sinon.stub().resolves({ focusedAt: {}, startedAt: 1 }),
    };
    addTabRecencyListeners(record, { settleMs: 150 });
  });

  afterEach(function () {
    clock.restore();
  });

  it('should record a tab activated in the focused window', async function () {
    listeners.activated({ tabId: 7, windowId: 1 });
    await clock.tickAsync(0);
    expect(record.touch.calledWith(7, 1000)).to.equal(true);
  });

  it('should not record a tab activated in a window without focus', async function () {
    browser.windows.get.resolves({ focused: false });
    listeners.activated({ tabId: 7, windowId: 1 });
    await clock.tickAsync(0);
    expect(record.touch.called).to.equal(false);
  });

  it('should record the active tab of a window that gets focus', async function () {
    browser.tabs.query = sinon.stub().resolves([{ id: 9 }]);
    listeners.focusChanged(2);
    await clock.tickAsync(149);
    expect(record.touch.called).to.equal(false);
    await clock.tickAsync(1);
    expect(browser.tabs.query.calledWith({ active: true, windowId: 2 })).to.equal(true);
    expect(record.touch.calledWith(9, 1000)).to.equal(true);
  });

  it('should ignore focus leaving the browser', async function () {
    listeners.focusChanged(-1);
    await clock.tickAsync(200);
    expect(record.touch.called).to.equal(false);
  });

  it('should forget a removed tab', async function () {
    listeners.removed(7);
    await clock.tickAsync(0);
    expect(record.forget.calledWith(7)).to.equal(true);
  });

  it('should answer the popup with the record', async function () {
    expect(await listeners.message({ type: GET_FOCUSED_AT })).to.deep.equal({
      focusedAt: {},
      startedAt: 1,
    });
    expect(listeners.message({ type: 'other' })).to.equal(undefined);
  });
});
