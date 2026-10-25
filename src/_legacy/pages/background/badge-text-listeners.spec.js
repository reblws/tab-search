import sinon from 'sinon';

// browser.tabs events whose listeners the test can fire
function createTabEvents() {
  const listeners = {};
  const events = {};
  ['onCreated', 'onRemoved', 'onUpdated', 'onDetached'].forEach((name) => {
    events[name] = { addListener: (fn) => { listeners[name] = fn; } };
  });
  return { listeners, events };
}

describe('badge text listeners', function () {
  let clock;
  let listeners;
  let counting;
  let badge;

  beforeEach(async function () {
    clock = sinon.useFakeTimers();
    const tabEvents = createTabEvents();
    listeners = tabEvents.listeners;
    Object.assign(browser.tabs, tabEvents.events);
    browser.windows.get = sinon.stub().resolves({ tabs: [{ id: 1 }, { id: 2 }] });
    browser.action = {
      setBadgeText: sinon.stub().resolves(),
      setBadgeBackgroundColor: sinon.stub().resolves(),
    };
    browser.runtime.getManifest = () => ({ manifest_version: 3 });
    badge = browser.action.setBadgeText;
    counting = true;
    const { addBadgeTextListeners } = await import('./badge-text-listeners.js');
    addBadgeTextListeners(() => Promise.resolve(counting));
  });

  afterEach(function () {
    clock.restore();
  });

  it('should update the badge of the window a tab opened in', async function () {
    listeners.onCreated({ windowId: 7 });
    await clock.tickAsync(100);
    expect(browser.windows.get.calledWith(7)).to.equal(true);
    expect(badge.calledWith({ text: '2', tabId: 1 })).to.equal(true);
  });

  it('should not update the badge if counting stops while a tab open is debounced', async function () {
    listeners.onCreated({ windowId: 7 });
    await clock.tickAsync(10);
    counting = false;
    await clock.tickAsync(200);
    expect(badge.called).to.equal(false);
  });

  it('should not update the badge if counting stops while a tab close is pending', async function () {
    listeners.onRemoved(3, { windowId: 7, isWindowClosing: false });
    // Past the debounce, inside the extra 100ms timeout
    await clock.tickAsync(80);
    counting = false;
    await clock.tickAsync(200);
    expect(badge.called).to.equal(false);
  });

  it('should drop pending updates when counting is stopped', async function () {
    const { stopCountingBadgeText } = await import('./badge-text-listeners.js');
    listeners.onUpdated(1, {}, { windowId: 7, id: 1, status: 'complete' });
    await clock.tickAsync(10);
    stopCountingBadgeText();
    await clock.tickAsync(500);
    expect(badge.calledWith({ text: '2', tabId: 1 })).to.equal(false);
  });
});
