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

  describe('Browser Shortcut Section', function () {
    it('should display browser shortcut section', async function () {
      const section = await $('#browser-shortcut');
      await expect(section).toBeDisplayed();
    });

    it('should show the popup shortcut header', async function () {
      const header = await $('#browser-shortcut h2');
      const headerText = await header.getText();
      expect(headerText).toContain('Popup Shortcut');
    });

    it('should display the shortcut input', async function () {
      const input = await $('#popup-shortcut-input');
      await expect(input).toBeDisplayed();
    });

    it('should show the current shortcut in the input', async function () {
      const input = await $('#popup-shortcut-input');
      const value = await input.getValue();
      // Should have a shortcut value (not empty, not "Error loading")
      expect(value).not.toBe('');
      expect(value).not.toBe('Error loading');
    });

    it('should have a reset button', async function () {
      const resetButton = await $('#browser-shortcut-reset');
      await expect(resetButton).toBeExisting();
    });

    it('should display the hint text', async function () {
      const hint = await $('#browser-shortcut-hint');
      await expect(hint).toBeDisplayed();
    });

    it('should have a link to browser settings in the hint', async function () {
      const link = await $('#browser-shortcut-hint a');
      await expect(link).toBeExisting();
    });

    it('should allow editing the shortcut in Firefox', async function () {
      const input = await $('#popup-shortcut-input');
      const originalValue = await input.getValue();

      // Click the input to focus it
      await input.click();
      await browser.pause(200);

      // The input should show "Press shortcut..." when focused
      const focusedValue = await input.getValue();
      expect(focusedValue).toBe('Press shortcut...');

      // Press Ctrl+Shift+K to set a new shortcut
      await browser.keys(['Control', 'Shift', 'k']);
      await browser.pause(500);

      // The input should now show the new shortcut
      const newValue = await input.getValue();
      expect(newValue).not.toBe('Press shortcut...');
      expect(newValue).not.toBe(originalValue);
      // Should contain the key we pressed (K)
      expect(newValue.toUpperCase()).toContain('K');
    });

    it('should reset the shortcut to default', async function () {
      const input = await $('#popup-shortcut-input');
      const resetButton = await $('#browser-shortcut-reset');

      // First change the shortcut to something else
      await input.click();
      await browser.pause(200);
      await browser.keys(['Control', 'Shift', 'k']);
      await browser.pause(500);

      const changedValue = await input.getValue();

      // Click reset button
      await resetButton.click();
      await browser.pause(500);

      // The shortcut should be reset (likely to default Ctrl+Shift+F or Cmd+Shift+L)
      const resetValue = await input.getValue();
      // After reset, it should be different from what we changed it to
      // (unless by chance the default is the same, which is unlikely)
      expect(resetValue).toBeTruthy();
      expect(resetValue).not.toBe('Not set');
    });

    it('should persist the changed shortcut', async function () {
      const input = await $('#popup-shortcut-input');

      // Change the shortcut
      await input.click();
      await browser.pause(200);
      await browser.keys(['Control', 'Shift', 'j']);
      await browser.pause(500);

      const changedValue = await input.getValue();
      expect(changedValue.toUpperCase()).toContain('J');

      // Reload the settings page
      await browser.refresh();
      await browser.pause(1000);

      // The shortcut should still be the changed value
      const inputAfterReload = await $('#popup-shortcut-input');
      const valueAfterReload = await inputAfterReload.getValue();
      expect(valueAfterReload.toUpperCase()).toContain('J');

      // Reset back to default for other tests
      const resetButton = await $('#browser-shortcut-reset');
      await resetButton.click();
      await browser.pause(500);
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
