import { openPopup } from './helpers/extension.js';

describe('Result context menu', function () {
  beforeEach(async function () {
    await openPopup();
    await $('.tab-object').waitForExist({ timeout: 5000 });
  });

  afterEach(async function () {
    // Close the native menu so it doesn't leak into the next test
    await browser.keys('Escape');
  });

  it('should register the TabSearch tab menu items', async function () {
    const missing = await browser.execute(() => Promise.all(
      ['tab-reload', 'tab-pin', 'tab-mute', 'tab-close'].map(id =>
        browser.menus.update(id, {}).then(() => null, () => id)),
    ).then(ids => ids.filter(Boolean)));
    expect(missing).toEqual([]);
  });

  it('should open the tab menu of the right-clicked tab result', async function () {
    // A second tab, so the menu's tab can't be the page's own tab by chance
    const otherTabId = await browser.execute(() => browser.tabs
      .create({ url: 'about:blank', active: false })
      .then(tab => tab.id));
    try {
      await openPopup();
      const row = await $(`.tab-object.tab[data-id="${otherTabId}"]`);
      await row.waitForExist({ timeout: 5000 });
      await browser.execute(() => {
        window.shownMenu = null;
        browser.menus.onShown.addListener((info, tab) => {
          window.shownMenu = {
            contexts: info.contexts,
            viewType: info.viewType,
            menuIds: info.menuIds,
            tabId: tab?.id,
          };
        });
      });
      await row.click({ button: 'right' });
      await browser.waitUntil(
        () => browser.execute(() => window.shownMenu !== null),
        { timeout: 5000, timeoutMsg: 'menus.onShown never fired' },
      );
      const shown = await browser.execute(() => window.shownMenu);
      expect(shown.contexts).toContain('tab');
      expect(shown.tabId).toBe(otherTabId);
      // The page runs in a tab here, not the toolbar popup, so viewTypes
      // keeps the TabSearch items out, as it does on the real tab strip
      expect(shown.viewType).toBe('tab');
      expect(shown.menuIds).not.toContain('tab-pin');
    } finally {
      await browser.keys('Escape');
      await browser.execute(id => browser.tabs.remove(id), otherTabId);
    }
  });
});
