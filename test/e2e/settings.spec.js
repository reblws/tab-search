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
    const shortcutOf = async () => (await $('#popup-shortcut')).getAttribute('data-shortcut');

    it('should display browser shortcut section', async function () {
      const section = await $('#browser-shortcut');
      await expect(section).toBeDisplayed();
    });

    it('should show the popup shortcut header', async function () {
      const header = await $('#browser-shortcut h3');
      const headerText = await header.getText();
      expect(headerText).toContain('Open TabSearch');
    });

    it('should show the current shortcut as keycaps', async function () {
      const button = await $('#popup-shortcut');
      await expect(button).toBeDisplayed();
      await browser.waitUntil(async () => (await shortcutOf()) !== '');
      expect((await button.$$('kbd')).length).toBeGreaterThan(0);
    });

    it('should display the hint text', async function () {
      const hint = await $('#browser-shortcut-hint');
      await expect(hint).toBeDisplayed();
    });

    it('should allow editing the shortcut in Firefox', async function () {
      const button = await $('#popup-shortcut');
      await browser.waitUntil(async () => (await shortcutOf()) !== '');
      const originalValue = await shortcutOf();

      await button.click();
      expect(await button.getText()).toBe('Press keys…');

      await browser.keys(['Control', 'Shift', 'k']);
      await browser.waitUntil(async () => (await shortcutOf()) !== originalValue, {
        timeoutMsg: 'The popup shortcut did not change',
      });
      expect((await shortcutOf()).toUpperCase()).toContain('K');
      expect(await button.getText()).not.toBe('Press keys…');
    });

    it('should reset the shortcut to default', async function () {
      const button = await $('#popup-shortcut');
      const resetButton = await $('#browser-shortcut-reset');

      await button.click();
      await browser.keys(['Control', 'Shift', 'k']);
      await resetButton.waitForDisplayed({ timeoutMsg: 'Reset did not appear for a changed shortcut' });

      await resetButton.click();
      await browser.waitUntil(async () => !(await shortcutOf()).toUpperCase().endsWith('+K'), {
        timeoutMsg: 'The shortcut was not reset',
      });
      expect(await shortcutOf()).toBeTruthy();
    });

    it('should persist the changed shortcut', async function () {
      const button = await $('#popup-shortcut');
      await button.click();
      await browser.keys(['Control', 'Shift', 'j']);
      await browser.waitUntil(async () => (await shortcutOf()).toUpperCase().includes('J'));

      await browser.refresh();
      await browser.waitUntil(async () => (await shortcutOf()).toUpperCase().includes('J'), {
        timeoutMsg: 'The changed shortcut was not kept after a reload',
      });

      // Reset back to default for other tests
      await $('#browser-shortcut-reset').click();
      await browser.waitUntil(async () => !(await shortcutOf()).toUpperCase().includes('J'));
    });
  });

  describe('Keyboard Shortcuts Section', function () {
    const slot = (key, which = 'command') => $(`#${key} .key-slot[data-key="${which}"]`);
    const shortcutOf = async (key, which) => (await slot(key, which)).getAttribute('data-shortcut');

    it('should display keyboard shortcuts section', async function () {
      const shortcutsSection = await $('#shortcuts');
      await expect(shortcutsSection).toBeDisplayed();
    });

    it('should display shortcut rows', async function () {
      await $('#TAB_NEXT').waitForExist();
      const rows = await $$('#shortcut-list .shortcut-row');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should have a reset button', async function () {
      const resetButton = await $('#shortcut-reset');
      await expect(resetButton).toBeDisplayed();
    });

    it('should rebind a shortcut and refuse one that is taken', async function () {
      await $('#shortcut-reset').click();
      const defaultShortcut = await shortcutOf('TAB_REFRESH');
      const pinShortcut = await shortcutOf('TAB_PIN');

      await (await slot('TAB_REFRESH')).click();
      await browser.keys(['Alt', 'p']);
      const error = await $('#TAB_REFRESH .field-error');
      await error.waitForDisplayed();
      expect(await error.getText()).toContain(`${pinShortcut} is already used by Pin Tab`);
      await browser.keys(['Escape']);
      expect(await shortcutOf('TAB_REFRESH')).toBe(defaultShortcut);

      await (await slot('TAB_REFRESH')).click();
      await browser.keys(['Control', 'y']);
      await browser.waitUntil(async () => (await shortcutOf('TAB_REFRESH')) !== defaultShortcut, {
        timeoutMsg: 'Refresh Tab was not rebound',
      });
      const rowReset = await $('#TAB_REFRESH .shortcut-row__reset button');
      await rowReset.waitForDisplayed();
      await rowReset.click();
      await browser.waitUntil(async () => (await shortcutOf('TAB_REFRESH')) === defaultShortcut, {
        timeoutMsg: 'Refresh Tab was not reset',
      });
      expect(await rowReset.isDisplayed()).toBe(false);
    });

    it('should remove a secondary shortcut with its remove button', async function () {
      // Start from the defaults, where Next Tab has a secondary shortcut
      await $('#shortcut-reset').click();
      const removeButton = await $('#TAB_NEXT .shortcut-row__remove');
      await removeButton.waitForDisplayed();
      expect(await removeButton.getTagName()).toBe('button');
      expect(await removeButton.getAttribute('aria-label'))
        .toBe('Remove secondary shortcut for Next Tab');
      const emptyShortcut = await shortcutOf('TAB_OPEN', 'secondaryCommand');
      expect(await $('#TAB_OPEN .shortcut-row__remove').isDisplayed()).toBe(false);

      await removeButton.click();
      await browser.waitUntil(async () => (await shortcutOf('TAB_NEXT', 'secondaryCommand')) === emptyShortcut, {
        timeoutMsg: 'The secondary shortcut was not removed',
      });
      expect(await removeButton.isDisplayed()).toBe(false);

      await $('#shortcut-reset').click();
      await removeButton.waitForDisplayed();
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

  describe('Live preview', function () {
    it('should follow the popup width and title settings', async function () {
      const popup = await $('#preview-popup');
      await browser.execute(() => document.getElementById('popupSize-small').click());
      await browser.waitUntil(async () => (await popup.getCSSProperty('width')).value === '300px', {
        timeoutMsg: 'The preview did not take the small width',
      });
      expect(await $('#popupSize-value').getText()).toBe('300');

      await browser.execute(() => document.getElementById('popupSize-medium').click());
      await browser.waitUntil(async () => (await popup.getCSSProperty('width')).value === '355px');
    });
  });

  describe('Find a setting', function () {
    it('should show only the settings that match', async function () {
      await $('#find').setValue('badge');
      await browser.waitUntil(async () => !(await $('#search').isDisplayed()));
      await expect($('#showTabCountBadgeText')).toBeDisplayed();
      await expect($('#popupBadgeColor')).toBeDisplayed();
      expect(await $('#searchAllWindows').isDisplayed()).toBe(false);

      await $('#find').setValue('no such setting');
      await expect($('#find-empty')).toBeDisplayed();

      await browser.keys(['Escape']);
      await expect($('#search')).toBeDisplayed();
      expect(await $('#find-empty').isDisplayed()).toBe(false);
    });
  });

  describe('Results Settings', function () {
    it('should save the most-recently-used sort choice', async function () {
      await browser.execute(() => document.getElementById('mruSort-always').click());
      await browser.refresh();
      await $('#mruSort-always').waitForExist();
      await browser.waitUntil(async () => $('#mruSort-always').isSelected(), {
        timeoutMsg: 'The sort choice was not kept after a reload',
      });
      await browser.execute(() => document.getElementById('mruSort-never').click());
      await browser.refresh();
      await browser.waitUntil(async () => $('#mruSort-never').isSelected());
    });

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
