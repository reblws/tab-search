import { Key } from 'webdriverio';
import {
  openSettings,
  evaluateInWorker,
  inExtension,
  getExtensionId,
} from './helpers/chrome.js';
import { startFixtureServer } from '../e2e-fixtures.js';

// The overlay is opened through the background's TabSearchOverlay.open(),
// the code a click on the toolbar button runs: WebDriver can't click the
// button or press its shortcut (see test/e2e-extension.js).
function openOverlayOnActiveTab() {
  return evaluateInWorker(`(async () => {
    await TabSearchOverlay.ready;
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    await TabSearchOverlay.open(tab);
    return tab.url;
  })()`);
}

const toolbarPopup = () => evaluateInWorker('chrome.action.getPopup({})');
const activeTabTitle = () => evaluateInWorker(`chrome.tabs.query({ active: true, lastFocusedWindow: true })
  .then(([tab]) => tab.title)`);
const seenByPage = () => browser.execute(() => window.seen);

async function setOverlaySetting(on) {
  await openSettings();
  const toggle = await $('#enableOverlay');
  await toggle.waitForExist();
  if ((await toggle.isSelected()) !== on) {
    await toggle.scrollIntoView();
    await toggle.click();
  }
  await browser.waitUntil(async () => ((await toolbarPopup()) === '') === on, {
    timeoutMsg: `The toolbar popup didn't follow the setting (${on})`,
  });
}

async function hostElement() {
  return $('tabsearch-overlay');
}

// Waits for the overlay's frame and switches into it
async function enterOverlay() {
  const host = await hostElement();
  await host.waitForExist({ timeoutMsg: 'The overlay never appeared' });
  const frame = await host.shadow$('iframe');
  await frame.waitForExist();
  await browser.waitUntil(
    async () => (await browser.execute(h => getComputedStyle(h).opacity, host)) === '1',
    { timeoutMsg: 'The overlay never became visible' },
  );
  await browser.switchToFrame(frame);
  await $('.tab-list .tab-object').waitForExist({ timeoutMsg: 'The overlay listed no tabs' });
  await browser.waitUntil(
    () => browser.execute(() => document.hasFocus() && document.activeElement.classList.contains('search')),
    { timeoutMsg: 'The search input never got the focus' },
  );
}

async function overlayIsGone() {
  await browser.switchToParentFrame();
  await browser.waitUntil(async () => !(await (await hostElement()).isExisting()), {
    timeoutMsg: 'The overlay is still there',
  });
}

function visibleTitles() {
  return browser.execute(() => Array.from(document.querySelectorAll('.tab-list .tab-object'))
    .map(el => el.querySelector('.tab-title').textContent));
}

// The fallback for pages the overlay can't show on: the toolbar popup, or
// the popup window when Chrome won't open the toolbar popup (say, while its
// window isn't focused)
async function popupTargets() {
  const base = `chrome-extension://${await getExtensionId()}/popup/index.html`;
  const { targetInfos } = await browser.sendCommandAndGetResult('Target.getTargets', {});
  return targetInfos.filter(t => t.url === base || t.url.startsWith(`${base}?surface=window`));
}
const popupIsOpen = async () => (await popupTargets()).length > 0;

// Chrome refuses to open the popup while it's already open
async function closePopups() {
  for (const { targetId } of await popupTargets()) {
    await browser.sendCommandAndGetResult('Target.closeTarget', { targetId });
  }
}

describe('Experimental overlay (Chrome)', function () {
  let server;
  let firstTab;

  before(async function () {
    server = await startFixtureServer();
    [firstTab] = await browser.getWindowHandles();
  });

  after(async function () {
    await browser.switchToWindow(firstTab);
    await setOverlaySetting(false).catch(() => {});
    await server.close();
  });

  beforeEach(async function () {
    // Leave only the first tab, on a blank page
    const handles = await browser.getWindowHandles();
    for (const handle of handles.slice(1)) {
      await browser.switchToWindow(handle);
      await browser.closeWindow();
    }
    await browser.switchToWindow(firstTab);
    await closePopups();
  });

  it('should keep the toolbar popup until the setting is turned on', async function () {
    await openSettings();
    expect(await toolbarPopup()).toMatch(/popup\/index\.html$/);
    await setOverlaySetting(true);
    expect(await toolbarPopup()).toBe('');
    await setOverlaySetting(false);
    expect(await toolbarPopup()).toMatch(/popup\/index\.html$/);
  });

  describe('turned on', function () {
    before(async function () {
      await browser.switchToWindow(firstTab);
      await setOverlaySetting(true);
    });

    it('should open over a page and list the open tabs', async function () {
      await browser.newWindow(server.url('/page', 'Overlay Other Tab'));
      await browser.newWindow(server.url('/page', 'Overlay Host Page'));
      await openOverlayOnActiveTab();
      await enterOverlay();
      expect(await browser.execute(() => document.documentElement.dataset.surface)).toBe('overlay');
      expect(await visibleTitles()).toEqual(expect.arrayContaining(['Overlay Other Tab', 'Overlay Host Page']));
      // The search input has the focus
      expect(await browser.execute(() => document.activeElement.classList.contains('search'))).toBe(true);
      // The key hints follow the user's shortcuts
      // (textContent: the row may still be fading in, and getText() skips it)
      expect(await browser.execute(() => document.querySelector('.overlay-hints').textContent))
        .toContain('to open');
    });

    it('should keep every keystroke from the page and close on Escape', async function () {
      await browser.newWindow(server.url('/page', 'Keystroke Page'));
      await openOverlayOnActiveTab();
      await enterOverlay();
      await browser.keys('keystroke');
      await browser.waitUntil(async () => (await visibleTitles()).length === 1);
      expect(await visibleTitles()).toEqual(['Keystroke Page']);
      await browser.keys(Key.Escape);
      await overlayIsGone();
      expect((await seenByPage()).keydown).toBe(0);
    });

    it('should switch to the chosen tab with Enter', async function () {
      await browser.newWindow(server.url('/page', 'Destination Tab'));
      await browser.newWindow(server.url('/page', 'Starting Tab'));
      await openOverlayOnActiveTab();
      await enterOverlay();
      await browser.keys('destination');
      await browser.waitUntil(async () => (await visibleTitles())[0] === 'Destination Tab');
      await browser.keys(Key.Enter);
      await browser.waitUntil(async () => (await activeTabTitle()) === 'Destination Tab', {
        timeoutMsg: 'Enter did not switch tabs',
      });
      // The page it was opened on no longer has it
      await browser.switchToParentFrame();
      expect(await (await hostElement()).isExisting()).toBe(false);
    });

    it('should close a tab from the list', async function () {
      await browser.newWindow(server.url('/page', 'Doomed Tab'));
      await browser.newWindow(server.url('/page', 'Closer Page'));
      await openOverlayOnActiveTab();
      await enterOverlay();
      await browser.keys('doomed');
      await browser.waitUntil(async () => (await visibleTitles())[0] === 'Doomed Tab');
      await browser.keys(Key.ArrowDown);
      // Key.Ctrl is Cmd on macOS; TabSearch binds the literal Control key
      await browser.keys([Key.Control, Key.Backspace]);
      await browser.waitUntil(async () => !(await evaluateInWorker(`chrome.tabs.query({})
        .then(tabs => tabs.some(t => t.title === 'Doomed Tab'))`)), { timeoutMsg: 'The tab is still open' });
      // The overlay stays open after closing a tab
      expect(await $('.search').isExisting()).toBe(true);
    });

    it('should close on a click outside the panel', async function () {
      await browser.newWindow(server.url('/page', 'Backdrop Page'));
      await openOverlayOnActiveTab();
      await enterOverlay();
      // The top left corner is backdrop
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

    it('should not close on a click inside the panel', async function () {
      await browser.newWindow(server.url('/page', 'Panel Click Page'));
      await openOverlayOnActiveTab();
      await enterOverlay();
      await $('header').click();
      await browser.pause(300);
      await browser.switchToParentFrame();
      expect(await (await hostElement()).isExisting()).toBe(true);
    });

    it('should close when opened again, like a toggle', async function () {
      await browser.newWindow(server.url('/page', 'Toggle Page'));
      await openOverlayOnActiveTab();
      await enterOverlay();
      await browser.switchToParentFrame();
      await openOverlayOnActiveTab();
      await overlayIsGone();
      // And opens once more
      await openOverlayOnActiveTab();
      await enterOverlay();
    });

    it('should give the focus back to the page when it closes', async function () {
      await browser.newWindow(server.url('/page', 'Focus Return Page'));
      await $('#page-input').click();
      await openOverlayOnActiveTab();
      await enterOverlay();
      await browser.keys(Key.Escape);
      await overlayIsGone();
      expect(await browser.execute(() => document.activeElement.id)).toBe('page-input');
    });

    it('should work on a page with a strict CSP', async function () {
      await browser.newWindow(server.url('/strict'));
      await openOverlayOnActiveTab();
      await enterOverlay();
      expect((await visibleTitles()).length).toBeGreaterThan(0);
    });

    it('should work over a modal dialog that traps the focus', async function () {
      await browser.newWindow(server.url('/modal'));
      await openOverlayOnActiveTab();
      await enterOverlay();
      await browser.keys('modal dialog');
      await browser.waitUntil(async () => (await visibleTitles())[0] === 'Modal dialog page', {
        timeoutMsg: 'Typing did not reach the overlay over the dialog',
      });
      expect(await browser.execute(() => document.activeElement.classList.contains('search'))).toBe(true);
    });

    it('should open the toolbar popup on the browser\'s own pages', async function () {
      await browser.newWindow('chrome://version/');
      await openOverlayOnActiveTab();
      await browser.waitUntil(popupIsOpen, { timeoutMsg: 'The toolbar popup did not open' });
      expect(await (await hostElement()).isExisting()).toBe(false);
      // and the button goes back to the overlay afterwards
      await browser.waitUntil(async () => (await toolbarPopup()) === '');
    });

    it('should fall back to the toolbar popup when the page stops the frame', async function () {
      await browser.newWindow(server.url('/sandbox'));
      await openOverlayOnActiveTab();
      await browser.waitUntil(popupIsOpen, {
        timeout: 8000,
        timeoutMsg: 'The toolbar popup did not open after the frame failed',
      });
      expect(await (await hostElement()).isExisting()).toBe(false);
    });
  });

  it('should show nothing when a site frames the popup page itself', async function () {
    await browser.newWindow(server.url('/page', 'Framing Site'));
    const id = await getExtensionId();
    await browser.execute((src) => {
      const frame = document.createElement('iframe');
      frame.id = 'stolen';
      frame.src = src;
      frame.style.cssText = 'width:600px;height:400px';
      document.body.prepend(frame);
    }, `chrome-extension://${id}/popup/index.html?surface=overlay#a1b2c3d4-e5f6-4789-abcd-0123456789ab`);
    await browser.pause(1000);
    await browser.switchToFrame(await $('#stolen'));
    expect(await browser.execute(() => document.documentElement.hidden)).toBe(true);
    expect(await browser.execute(() => document.querySelectorAll('.tab-object').length)).toBe(0);
    await browser.switchToParentFrame();
  });

  it('should leave the popup page as it was in the toolbar popup', async function () {
    await setOverlaySetting(false);
    await browser.url(`chrome-extension://${await getExtensionId()}/popup/index.html`);
    await $('.tab-list .tab-object').waitForExist();
    expect(await inExtension(() => document.documentElement.dataset.surface)).toBe('popup');
    expect(await $('.overlay-hints').isExisting()).toBe(false);
  });
});
