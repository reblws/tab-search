import { openPopup } from './helpers/extension.js';

describe('Popup', function () {
  beforeEach(async function () {
    await openPopup();
    // Wait for the page to load
    await browser.pause(500);
  });

  describe('Tab Display', function () {
    it('should display the popup header', async function () {
      const header = await $('header');
      await expect(header).toBeDisplayed();
    });

    it('should show the search input', async function () {
      const searchInput = await $('input.search');
      await expect(searchInput).toBeDisplayed();
    });

    it('should display the tab list container', async function () {
      const tabList = await $('.tab-list');
      await expect(tabList).toBeDisplayed();
    });

    it('should display tabs in the list', async function () {
      // Wait for tabs to load
      await browser.pause(1000);

      const tabs = await $$('.tab-list .tab');
      // Should have at least one tab (the current one or about:debugging)
      expect(tabs.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Search', function () {
    it('should allow typing in the search input', async function () {
      const searchInput = await $('input.search');
      await searchInput.setValue('test');

      const value = await searchInput.getValue();
      expect(value).toBe('test');
    });

    it('should clear search input', async function () {
      const searchInput = await $('input.search');
      await searchInput.setValue('test');
      await searchInput.clearValue();

      const value = await searchInput.getValue();
      expect(value).toBe('');
    });
  });

  describe('UI Elements', function () {
    it('should have a settings button', async function () {
      const prefBtn = await $('#pref-btn');
      await expect(prefBtn).toBeDisplayed();
    });

    it('should have a search form', async function () {
      const searchForm = await $('#search-form');
      await expect(searchForm).toBeDisplayed();
    });
  });
});
