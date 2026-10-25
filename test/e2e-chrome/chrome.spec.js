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

// The popup shortcut as chrome.commands reports it ('' when not assigned)
function popupShortcut() {
  return inExtension(() => chrome.commands.getAll()
    .then(cmds => cmds.find(c => c.name === '_execute_action').shortcut));
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

  describe('Popup shortcut', function () {
    it('should assign the suggested popup shortcut as an active binding', async function () {
      // Chrome lists a suggested key that collides with a browser shortcut on
      // chrome://extensions/shortcuts, but leaves it inactive
      const { commands } = await getExtensionInfo();
      const command = commands.find(c => c.name === '_execute_action');
      expect(command.keybinding).not.toBe('');
      expect(command.isActive).toBe(true);
    });

    it('should show the popup shortcut on the settings page', async function () {
      await openSettings();
      const shortcut = await popupShortcut();
      expect(shortcut).not.toBe('');
      await browser.waitUntil(async () => (await $('#popup-shortcut-input').getValue()) === shortcut, {
        timeoutMsg: `The settings page did not show ${shortcut}`,
      });
    });

    it('should open Chrome\'s shortcuts page from the read-only shortcut field', async function () {
      await openSettings();
      const input = await $('#popup-shortcut-input');
      await browser.waitUntil(async () => (await input.getValue()) !== '');
      const before = await input.getValue();
      expect(await input.getAttribute('readonly')).not.toBe(null);
      expect(await $('#browser-shortcut-reset').isDisplayed()).toBe(false);
      expect(await $('#browser-shortcut-hint').getText()).toContain('Keyboard shortcuts');

      const shortcutsTargets = async () => (await browser.sendCommandAndGetResult('Target.getTargets', {}))
        .targetInfos.filter(t => t.url.startsWith('chrome://extensions/shortcuts'));
      expect(await shortcutsTargets()).toEqual([]);
      const settingsHandle = await browser.getWindowHandle();
      await input.click();
      await browser.waitUntil(async () => (await shortcutsTargets()).length === 1, {
        timeoutMsg: 'Clicking the shortcut field did not open chrome://extensions/shortcuts',
      });
      await browser.switchToWindow(settingsHandle);
      // Typing a shortcut doesn't change the field
      await browser.keys([Key.Control, Key.Shift, 'k']);
      expect(await input.getValue()).toBe(before);

      // Keyboard users can open it too
      await closeTab((await shortcutsTargets())[0].targetId);
      await browser.execute(el => el.focus(), input);
      await browser.keys([Key.Enter]);
      await browser.waitUntil(async () => (await shortcutsTargets()).length === 1, {
        timeoutMsg: 'Enter on the shortcut field did not open chrome://extensions/shortcuts',
      });
      await closeTab((await shortcutsTargets())[0].targetId);
      await browser.switchToWindow(settingsHandle);
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

    it('should show the popup shortcut in the search placeholder', async function () {
      const shortcut = await popupShortcut();
      expect(shortcut).not.toBe('');
      await browser.waitUntil(async () => (await $('input.search').getAttribute('placeholder'))
        === `Search for a tab (${shortcut})`, {
        timeoutMsg: `The placeholder did not show ${shortcut}`,
      });
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

    it('should show the last query in the popup after the worker stops', async function () {
      const setShowLastQuery = async (enabled) => {
        await openSettings();
        const checkbox = await $('#showLastQueryOnPopup');
        await checkbox.waitForExist();
        if ((await checkbox.isSelected()) !== enabled) {
          await browser.execute(el => el.click(), checkbox);
        }
        await browser.waitUntil(async () => (await readSavedGeneralSettings())?.showLastQueryOnPopup === enabled);
      };
      await setShowLastQuery(true);

      await openPopup();
      await $('input.search').setValue('fixture query');
      await browser.waitUntil(() => inExtension(() => chrome.storage.session.get('persist:state')
        .then(items => JSON.stringify(items).includes('fixture query'))), {
        timeoutMsg: 'The last query was not saved to storage.session',
      });

      // Chrome discards the worker ~30s after the popup closes
      await stopWorker();
      await openPopup();
      await browser.waitUntil(async () => (await $('input.search').getValue()) === 'fixture query', {
        timeoutMsg: 'The popup did not show the last query after a worker restart',
      });

      // Restore
      await $('input.search').clearValue();
      await setShowLastQuery(false);
    });

    it('should keep an open settings page in sync after the worker stops', async function () {
      await openSettings();
      const refreshInput = () => $('#TAB_REFRESH input[data-key="command"]');
      await (await refreshInput()).waitForExist();
      const defaultShortcut = await (await refreshInput()).getValue();
      const valueIsNot = (...values) => async () => !values.includes(await (await refreshInput()).getValue());

      // Rebind Refresh Tab; the row only changes when the worker pushes the new state
      await (await refreshInput()).click();
      // Key.Ctrl is Cmd on macOS; TabSearch binds the literal Control key
      await browser.keys([Key.Control, 'y']);
      await browser.waitUntil(valueIsNot(defaultShortcut, 'Enter your shortcut...'), {
        timeoutMsg: 'Refresh Tab was not rebound',
      });

      // The page stays open while the worker stops, which disconnects its port
      await stopWorker();
      await $('#shortcut-reset').click();
      await browser.waitUntil(async () => (await (await refreshInput()).getValue()) === defaultShortcut, {
        timeoutMsg: 'The open settings page did not show the reset shortcut after a worker restart',
      });

      // A second change goes over the new connection
      await stopWorker();
      await (await refreshInput()).click();
      await browser.keys([Key.Control, 'y']);
      await browser.waitUntil(valueIsNot(defaultShortcut, 'Enter your shortcut...'), {
        timeoutMsg: 'Refresh Tab was not rebound after a second worker restart',
      });
      await $('#shortcut-reset').click();
      await browser.waitUntil(async () => (await (await refreshInput()).getValue()) === defaultShortcut);
    });

    it('should remove a secondary shortcut with its button after the worker stops', async function () {
      await openSettings();
      // Start from the defaults, where Next Tab has a secondary shortcut
      await $('#shortcut-reset').click();
      const secondaryInput = () => $('#TAB_NEXT input[data-key="secondaryCommand"]');
      const removeButton = () => $('#TAB_NEXT .shortcut-table__remove');
      await (await removeButton()).waitForDisplayed();
      expect(await (await removeButton()).getTagName()).toBe('button');
      expect(await (await removeButton()).getAttribute('aria-label'))
        .toBe('Remove secondary shortcut for Next Tab');
      // Rows without a secondary shortcut keep the button's space but hide it
      const emptyShortcut = await $('#TAB_OPEN input[data-key="secondaryCommand"]').getValue();
      expect(await $('#TAB_OPEN .shortcut-table__remove').isDisplayed()).toBe(false);

      await stopWorker();
      await (await removeButton()).click();
      await browser.waitUntil(async () => (await (await secondaryInput()).getValue()) === emptyShortcut, {
        timeoutMsg: 'The secondary shortcut was not removed',
      });
      expect(await (await removeButton()).isDisplayed()).toBe(false);

      await $('#shortcut-reset').click();
      await (await removeButton()).waitForDisplayed();
    });

    it('should catch up on changes made elsewhere when a disconnected settings page is focused', async function () {
      await openSettings();
      const refreshInput = () => $('#TAB_REFRESH input[data-key="command"]');
      await (await refreshInput()).waitForExist();
      const defaultShortcut = await (await refreshInput()).getValue();
      await (await refreshInput()).click();
      await browser.keys([Key.Control, 'y']);
      await browser.waitUntil(async () => !([defaultShortcut, 'Enter your shortcut...']
        .includes(await (await refreshInput()).getValue())));

      await stopWorker();
      // Another page resets the shortcuts: send the message outside this page's store
      await inExtension(() => chrome.runtime.sendMessage({
        type: '@@STORE_DISPATCH',
        action: { type: 'KEYBINDING_DEFAULT_RESET', payload: {} },
      }));
      await browser.pause(500);
      // Nothing pushes the change to this page while its port is down
      expect(await (await refreshInput()).getValue()).not.toBe(defaultShortcut);

      // Headless windows don't get real focus changes
      await browser.execute(() => window.dispatchEvent(new Event('focus')));
      await browser.waitUntil(async () => (await (await refreshInput()).getValue()) === defaultShortcut, {
        timeoutMsg: 'The settings page did not catch up when it was focused',
      });
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
