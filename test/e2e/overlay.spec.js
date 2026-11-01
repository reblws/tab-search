import { Key } from 'webdriverio';
import { getExtensionId } from './helpers/extension.js';
import { startFixtureServer } from '../e2e-fixtures.js';

// Firefox runs the overlay's frame with only the content script APIs, so
// these also check that its tab calls and events go through the background
// (core/overlay/remote.js).
//
// WebDriver can't click the toolbar button, so a control tab with an
// extension page opens the overlay through the background's
// TabSearchOverlay.open(), the code the click runs (test/e2e-extension.js).
let controlHandle;

async function inControl(fn, ...args) {
  const back = await browser.getWindowHandle();
  await browser.switchToWindow(controlHandle);
  try {
    return await browser.executeAsync(`
      const done = arguments[arguments.length - 1];
      Promise.resolve((${fn}).apply(null, Array.from(arguments).slice(0, -1)))
        .then(done, e => done({ error: String(e && e.message || e) }));
    `, ...args);
  } finally {
    await browser.switchToWindow(back);
  }
}

// Opens the overlay on the tab WebDriver is in
async function openOverlayHere() {
  const url = await browser.getUrl();
  const result = await inControl(async (tabUrl) => {
    const bg = await browser.runtime.getBackgroundPage();
    await bg.TabSearchOverlay.ready;
    const tab = (await browser.tabs.query({})).find(t => t.url === tabUrl);
    await browser.tabs.update(tab.id, { active: true });
    await bg.TabSearchOverlay.open(tab);
    return 'ok';
  }, url.replace(/#.*$/, ''));
  if (result !== 'ok') throw new Error(`Couldn't open the overlay: ${JSON.stringify(result)}`);
}

const toolbarPopup = () => inControl(() => browser.browserAction.getPopup({}));

// Switching WebDriver to the control tab activates it, so the control page
// records tab events as they happen, for the specs to read afterwards
const recordTabEvents = () => inControl(() => {
  window.tabEvents = [];
  browser.tabs.onActivated.addListener(({ tabId }) => window.tabEvents.push(['activated', tabId]));
  browser.tabs.onRemoved.addListener(tabId => window.tabEvents.push(['removed', tabId]));
  return true;
});
const tabEvents = () => inControl(() => window.tabEvents || []);
const tabIdByTitle = title => inControl(t => browser.tabs.query({})
  .then(tabs => (tabs.find(tab => tab.title === t) || {}).id), title);

async function setOverlaySetting(on) {
  await browser.switchToWindow(controlHandle);
  await browser.url(`moz-extension://${await getExtensionId()}/settings/index.html`);
  const toggle = await $('#enableOverlay');
  await toggle.waitForExist();
  if ((await toggle.isSelected()) !== on) {
    await toggle.scrollIntoView();
    await toggle.click();
  }
  await browser.waitUntil(async () => {
    const popup = await browser.executeAsync(done => browser.browserAction.getPopup({}).then(done));
    return (popup === '') === on;
  }, { timeoutMsg: `The toolbar popup didn't follow the setting (${on})` });
}

const hostElement = () => $('tabsearch-overlay');

async function enterOverlay() {
  const host = await hostElement();
  await host.waitForExist({ timeoutMsg: 'The overlay never appeared' });
  const frame = await host.shadow$('iframe');
  await browser.waitUntil(
    async () => (await browser.execute(h => getComputedStyle(h).opacity, host)) === '1',
    { timeoutMsg: 'The overlay never became visible' },
  );
  // Firefox's WebDriver BiDi needs switchFrame; switchToFrame doesn't enter
  // a frame inside a shadow root
  await browser.switchFrame(frame);
  await $('.tab-list .tab-object').waitForExist({ timeoutMsg: 'The overlay listed no tabs' });
  await browser.waitUntil(
    () => browser.execute(() => document.activeElement.classList.contains('search')),
    { timeoutMsg: 'The search input never got the focus' },
  );
}

async function overlayIsGone() {
  await browser.switchFrame(null);
  await browser.waitUntil(async () => !(await (await hostElement()).isExisting()), {
    timeoutMsg: 'The overlay is still there',
  });
}

const visibleTitles = () => browser.execute(() => Array.from(document.querySelectorAll('.tab-list .tab-object'))
  .map(el => el.querySelector('.tab-title').textContent));

// Opens url in a new tab of the same window and switches to it
async function openPage(url) {
  await browser.newWindow(url, { type: 'tab' });
}

describe('Experimental overlay (Firefox)', function () {
  let server;

  before(async function () {
    server = await startFixtureServer();
    controlHandle = await browser.getWindowHandle();
    await setOverlaySetting(true);
  });

  after(async function () {
    await browser.switchToWindow(controlHandle);
    await setOverlaySetting(false).catch(() => {});
    await server.close();
  });

  beforeEach(async function () {
    const handles = await browser.getWindowHandles();
    for (const handle of handles) {
      if (handle !== controlHandle) {
        await browser.switchToWindow(handle);
        await browser.closeWindow();
      }
    }
    await browser.switchToWindow(controlHandle);
  });

  it('should turn the toolbar popup off while the setting is on', async function () {
    expect(await toolbarPopup()).toBe('');
  });

  it('should list the open tabs through the background', async function () {
    await openPage(server.url('/page', 'Firefox Other Tab'));
    await openPage(server.url('/page', 'Firefox Host Page'));
    await openOverlayHere();
    await enterOverlay();
    expect(await browser.execute(() => document.documentElement.dataset.surface)).toBe('overlay');
    // The frame really is missing the tabs API; the list comes from the background
    expect(await browser.execute(() => typeof browser.tabs.query)).toBe('function');
    expect(await visibleTitles()).toEqual(expect.arrayContaining(['Firefox Other Tab', 'Firefox Host Page']));
  });

  it('should keep keystrokes from the page and close on Escape', async function () {
    await openPage(server.url('/page', 'Firefox Keystroke Page'));
    await openOverlayHere();
    await enterOverlay();
    await browser.keys('keystroke');
    await browser.waitUntil(async () => (await visibleTitles()).length === 1);
    expect(await visibleTitles()).toEqual(['Firefox Keystroke Page']);
    await browser.keys(Key.Escape);
    await overlayIsGone();
    expect((await browser.execute(() => window.seen)).keydown).toBe(0);
  });

  it('should switch to the chosen tab with Enter', async function () {
    await openPage(server.url('/page', 'Firefox Destination'));
    await openPage(server.url('/page', 'Firefox Start'));
    const destination = await tabIdByTitle('Firefox Destination');
    await recordTabEvents();
    await openOverlayHere();
    await enterOverlay();
    await browser.keys('destination');
    await browser.waitUntil(async () => (await visibleTitles())[0] === 'Firefox Destination');
    await browser.keys(Key.Enter);
    await browser.waitUntil(
      async () => (await tabEvents()).some(([type, id]) => type === 'activated' && id === destination),
      { timeoutMsg: 'Enter did not switch tabs' },
    );
  });

  it('should close a tab and follow the change', async function () {
    await openPage(server.url('/page', 'Firefox Doomed'));
    await openPage(server.url('/page', 'Firefox Closer'));
    const doomed = await tabIdByTitle('Firefox Doomed');
    await recordTabEvents();
    await openOverlayHere();
    await enterOverlay();
    await browser.keys('doomed');
    await browser.waitUntil(async () => (await visibleTitles())[0] === 'Firefox Doomed');
    await browser.keys(Key.ArrowDown);
    await browser.keys([Key.Control, Key.Backspace]);
    // The row turns into a recently closed one, from the tab events the
    // background passes on
    await browser.waitUntil(
      () => browser.execute(() => !!document.querySelector('.tab-list .session')),
      { timeoutMsg: 'The closed tab never became a recently closed row' },
    );
    expect((await tabEvents()).some(([type, id]) => type === 'removed' && id === doomed)).toBe(true);
  });

  it('should close on a click outside the panel', async function () {
    await openPage(server.url('/page', 'Firefox Backdrop'));
    await openOverlayHere();
    await enterOverlay();
    await browser.performActions([{
      type: 'pointer',
      id: 'mouse',
      parameters: { pointerType: 'mouse' },
      actions: [
        { type: 'pointerMove', x: 8, y: 8, origin: 'viewport' },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerUp', button: 0 },
      ],
    }]);
    await overlayIsGone();
  });

  it('should work on a page with a strict CSP', async function () {
    await openPage(server.url('/strict'));
    await openOverlayHere();
    await enterOverlay();
    expect((await visibleTitles()).length).toBeGreaterThan(0);
  });

  it('should show nothing when a site frames the popup page itself', async function () {
    await openPage(server.url('/page', 'Firefox Framing Site'));
    const id = await getExtensionId();
    await browser.execute((src) => {
      const frame = document.createElement('iframe');
      frame.id = 'stolen';
      frame.src = src;
      document.body.prepend(frame);
    }, `moz-extension://${id}/popup/index.html?surface=overlay#a1b2c3d4-e5f6-4789-abcd-0123456789ab`);
    await browser.pause(1000);
    await browser.switchFrame(await $('#stolen'));
    expect(await browser.execute(() => document.documentElement.hidden)).toBe(true);
    expect(await browser.execute(() => document.querySelectorAll('.tab-object').length)).toBe(0);
    await browser.switchFrame(null);
  });

  it('should fall back on the browser\'s own pages', async function () {
    await openPage('about:blank');
    await openOverlayHere();
    // The toolbar popup, or a popup window where Firefox won't open it
    await browser.waitUntil(() => inControl(() => browser.windows.getAll({ windowTypes: ['popup'] })
      .then(wins => wins.length > 0 || browser.extension.getViews({ type: 'popup' }).length > 0)), {
      timeoutMsg: 'Neither the toolbar popup nor a window opened',
    });
    expect(await (await hostElement()).isExisting()).toBe(false);
    await browser.waitUntil(async () => (await toolbarPopup()) === '');
  });
});
