import { openSettings } from './helpers/extension.js';

describe('Settings', function () {
  beforeEach(async function () {
    await openSettings();
    // Wait for the page to load
    await browser.pause(500);
  });

  describe('Page Load', function () {
    it('should display the settings page', async function () {
      const header = await $('h1');
      await expect(header).toBeDisplayed();
    });

    it('should show the settings header text', async function () {
      const header = await $('h1');
      const headerText = await header.getText();
      expect(headerText).toContain('TabSearch Settings');
    });

    it('should display the form', async function () {
      const form = await $('form');
      await expect(form).toBeDisplayed();
    });
  });

  describe('General Settings', function () {
    it('should display checkbox options', async function () {
      const checkboxes = await $$('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should display the show visual delete button checkbox', async function () {
      const checkbox = await $('#showVisualDeleteTabButton');
      await expect(checkbox).toBeExisting();
    });

    it('should display tab count badge checkbox', async function () {
      const checkbox = await $('#showTabCountBadgeText');
      await expect(checkbox).toBeExisting();
    });
  });

  describe('Keyboard Shortcuts Section', function () {
    it('should display keyboard shortcuts section', async function () {
      const shortcutsSection = await $('#shortcuts');
      await expect(shortcutsSection).toBeDisplayed();
    });

    it('should display shortcuts table', async function () {
      const table = await $('#shortcut-table');
      await expect(table).toBeDisplayed();
    });

    it('should display shortcut rows', async function () {
      // Wait for shortcuts to load
      await browser.pause(1000);
      const rows = await $$('#shortcut-table tbody tr');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should have a reset button', async function () {
      const resetButton = await $('#shortcut-reset');
      await expect(resetButton).toBeDisplayed();
    });
  });

  describe('Color Settings', function () {
    it('should display color inputs', async function () {
      const colorInputs = await $$('input[type="color"]');
      expect(colorInputs.length).toBeGreaterThan(0);
    });

    it('should display popup badge color input', async function () {
      const colorInput = await $('#popupBadgeColor');
      await expect(colorInput).toBeExisting();
    });

    it('should display tab color input', async function () {
      const colorInput = await $('#tabColor');
      await expect(colorInput).toBeExisting();
    });
  });

  describe('Behavior Settings', function () {
    it('should display search by url checkbox', async function () {
      const checkbox = await $('#showUrls');
      await expect(checkbox).toBeExisting();
    });

    it('should display fuzzy search checkbox', async function () {
      const checkbox = await $('#enableFuzzySearch');
      await expect(checkbox).toBeExisting();
    });

    it('should display threshold slider', async function () {
      const slider = await $('#threshold');
      await expect(slider).toBeExisting();
    });
  });

  describe('Results Settings', function () {
    it('should display search all windows checkbox', async function () {
      const checkbox = await $('#searchAllWindows');
      await expect(checkbox).toBeExisting();
    });

    it('should display show bookmarks checkbox', async function () {
      const checkbox = await $('#showBookmarks');
      await expect(checkbox).toBeExisting();
    });

    it('should display show history checkbox', async function () {
      const checkbox = await $('#showHistory');
      await expect(checkbox).toBeExisting();
    });

    it('should display show recently closed checkbox', async function () {
      const checkbox = await $('#showRecentlyClosed');
      await expect(checkbox).toBeExisting();
    });
  });
});
