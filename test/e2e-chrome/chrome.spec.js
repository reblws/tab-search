import { Key } from 'webdriverio';
import {
  getExtensionInfo,
  getExtensionId,
  openPopup,
  openSettings,
  closeTab,
  evaluateInWorker,
  isWorkerRunning,
  openTab,
  stopWorker,
  inExtension,
} from './helpers/chrome.js';

const pageUrl = title => `data:text/html,<title>${encodeURIComponent(title)}</title><h1>${encodeURIComponent(title)}</h1>`;
const TEST_TABS = ['Alpha Fixture', 'Beta Fixture', 'Gamma Fixture'];

// Saved general settings, as redux-persist wrote them to storage.local
function readSavedGeneralSettings() {
  return inExtension(() => chrome.storage.local.get('persist:root')
    .then(({ 'persist:root': root }) => (root ? JSON.parse(JSON.parse(root).general) : null)));
}

function visibleTabTitles() {
  return browser.execute(() => Array.from(document.querySelectorAll('.tab-list .tab-object'))
    .filter(el => el.offsetParent !== null)
    .map(el => el.querySelector('.tab-title').textContent));
}

describe('Chrome MV3 build', function () {
  // Start every test from a live window, even if the last one closed it
  beforeEach(async function () {
    const [handle] = await browser.getWindowHandles();
    await browser.switchToWindow(handle);
  });

  describe('Load', function () {
    it('should load the extension enabled with no manifest errors', async function () {
      const info = await getExtensionInfo();
      expect(info.state).toBe('ENABLED');
      expect(info.manifestErrors).toEqual([]);
      expect(info.installWarnings).toEqual([]);
    });

    it('should start the service worker', async function () {
      await getExtensionId();
      expect(await isWorkerRunning()).toBe(true);
    });

    it('should use Manifest V3', async function () {
      await openPopup();
      expect(await inExtension(() => chrome.runtime.getManifest().manifest_version)).toBe(3);
    });
  });

  describe('Popup', function () {
    let fixtureTabIds;

    before(async function () {
      await openPopup();
      fixtureTabIds = await inExtension(
        (urls) => Promise.all(urls.map(url => chrome.tabs.create({ url, active: false })))
          .then(tabs => tabs.map(t => t.id)),
        TEST_TABS.map(pageUrl),
      );
      // Wait for the fixture tabs to load their titles
      await browser.waitUntil(() => inExtension(
        ids => Promise.all(ids.map(id => chrome.tabs.get(id)))
          .then(tabs => tabs.every(t => t.status === 'complete')),
        fixtureTabIds,
      ));
    });

    after(async function () {
      await openPopup();
      // Keep the current tab: it may be a fixture tab the popup now runs in
      await inExtension(ids => chrome.tabs.getCurrent()
        .then(current => chrome.tabs.remove(ids.filter(id => id !== current.id))), fixtureTabIds);
    });

    beforeEach(async function () {
      await openPopup();
      await $('.tab-list .tab-object').waitForExist();
    });

    it('should list the open tabs', async function () {
      const titles = await visibleTabTitles();
      TEST_TABS.forEach(title => expect(titles).toContain(title));
    });

    it('should filter the list by the search query', async function () {
      await $('input.search').setValue('beta');
      await browser.waitUntil(async () => {
        const titles = await visibleTabTitles();
        // Fuzzy search keeps weaker matches lower in the list
        return titles[0] === 'Beta Fixture';
      }, { timeoutMsg: 'Search did not put Beta Fixture first' });
    });

    it('should show the MV3 shortcut in the search placeholder only when set', async function () {
      const shortcut = await inExtension(() => chrome.commands.getAll()
        .then(cmds => cmds.find(c => c.name === '_execute_action').shortcut));
      await browser.pause(500);
      const placeholder = await $('input.search').getAttribute('placeholder');
      if (shortcut) {
        expect(placeholder).toContain('(');
      } else {
        // Chrome leaves suggested keys unset for command-line loaded extensions
        expect(placeholder).toBe('Search for a tab');
      }
    });

    it('should copy the selected tab URL with Ctrl+C', async function () {
      await $('input.search').setValue('alpha');
      await browser.waitUntil(async () => (await visibleTabTitles())[0] === 'Alpha Fixture');
      // Key.Ctrl is Cmd on macOS; TabSearch binds the literal Control key
      await browser.keys([Key.Control, 'c']);
      // Headless Chrome keeps its own clipboard; paste it back into the search box
      await $('input.search').clearValue();
      await $('input.search').click();
      // The platform paste shortcut: Key.Ctrl is Cmd on macOS
      await browser.keys([Key.Ctrl, 'v']);
      await browser.waitUntil(async () => (await $('input.search').getValue()) !== '', {
        timeoutMsg: 'Nothing was pasted from the clipboard',
      });
      expect(decodeURIComponent(await $('input.search').getValue()))
        .toBe(decodeURIComponent(pageUrl('Alpha Fixture')));
    });

    it('should switch to the selected tab on Enter', async function () {
      const popupHandle = await browser.getWindowHandle();
      await $('input.search').setValue('gamma');
      await browser.waitUntil(async () => (await visibleTabTitles())[0] === 'Gamma Fixture');
      // Element send-keys: chromedriver 123 crashes if the page closes during
      // a browser.keys() action
      await $('input.search').addValue(Key.Enter);
      // The popup page closes itself after switching
      await browser.waitUntil(async () => !(await browser.getWindowHandles()).includes(popupHandle), {
        timeoutMsg: 'Popup tab did not close after Enter',
      });
      // Ask the worker: switching to another window handle would activate it
      await browser.waitUntil(
        () => evaluateInWorker(`chrome.tabs.get(${fixtureTabIds[2]}).then(t => t.active)`),
        { timeoutMsg: 'Gamma Fixture did not become the active tab' },
      );
      await browser.switchToWindow((await browser.getWindowHandles())[0]);
    });
  });

  describe('Service worker restart', function () {
    it('should keep a changed setting after the worker stops', async function () {
      await openSettings();
      const checkbox = await $('#searchAllWindows');
      await checkbox.waitForExist();
      const original = await checkbox.isSelected();
      // The real checkbox is visually hidden behind a styled toggle
      await browser.execute(el => el.click(), checkbox);
      await browser.waitUntil(async () => (await readSavedGeneralSettings())?.searchAllWindows === !original, {
        timeoutMsg: 'The setting was not saved to storage.local',
      });

      await stopWorker();
      await openSettings();
      // The page wakes the worker; it must answer with the saved state, not defaults
      await browser.waitUntil(async () => (await $('#searchAllWindows').isSelected()) === !original, {
        timeoutMsg: 'Settings page showed the default value after a worker restart',
      });

      // Restore
      await browser.execute(el => el.click(), await $('#searchAllWindows'));
      await browser.waitUntil(async () => (await readSavedGeneralSettings())?.searchAllWindows === original);
    });

    it('should update the tab count badge when a tab opens while the worker is stopped', async function () {
      await openPopup();
      const tabCount = () => inExtension(() => chrome.tabs.query({ currentWindow: true }).then(t => t.length));
      const badgeText = () => inExtension(() => chrome.tabs.getCurrent()
        .then(tab => chrome.action.getBadgeText({ tabId: tab.id })));
      await browser.waitUntil(async () => (await badgeText()) === String(await tabCount()), {
        timeoutMsg: 'Badge never matched the tab count',
      });
      const countBefore = await tabCount();

      await stopWorker();
      // No window switch: the popup page must not message the worker, so
      // only the tabs.onCreated event can wake it
      const newTab = await openTab('about:blank');
      await browser.waitUntil(isWorkerRunning, { timeoutMsg: 'tabs.onCreated did not wake the worker' });
      expect(await tabCount()).toBe(countBefore + 1);
      await browser.waitUntil(async () => (await badgeText()) === String(countBefore + 1), {
        timeoutMsg: 'Badge did not follow the new tab after a worker restart',
      });

      await closeTab(newTab);
    });
  });
});
