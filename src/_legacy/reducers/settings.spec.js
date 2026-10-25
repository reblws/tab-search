import generalSettingsReducer from './settings.js';
import { initialGeneralSettings } from './defaults.js';
import {
  CHECKBOX_UPDATE,
  SETTINGS_RESET,
  NUMBER_UPDATE,
  SETTING_RESET,
} from '../actions/types.js';

describe('generalSettingsReducer', function () {
  describe('initial state', function () {
    it('should return initial general settings when state is undefined', function () {
      const result = generalSettingsReducer(undefined, { type: 'UNKNOWN' });
      expect(result).to.deep.equal(initialGeneralSettings);
    });
  });

  describe('CHECKBOX_UPDATE', function () {
    it('should update ignorePinnedTabs to true', function () {
      const action = {
        type: CHECKBOX_UPDATE,
        payload: { key: 'ignorePinnedTabs', value: true },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.ignorePinnedTabs).to.equal(true);
    });

    it('should update showHistory to true', function () {
      const action = {
        type: CHECKBOX_UPDATE,
        payload: { key: 'showHistory', value: true },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.showHistory).to.equal(true);
    });

    it('should update showBookmarks to true', function () {
      const action = {
        type: CHECKBOX_UPDATE,
        payload: { key: 'showBookmarks', value: true },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.showBookmarks).to.equal(true);
    });

    it('should update searchAllWindows to false', function () {
      const action = {
        type: CHECKBOX_UPDATE,
        payload: { key: 'searchAllWindows', value: false },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.searchAllWindows).to.equal(false);
    });

    it('should update showRecentlyClosed to false', function () {
      const action = {
        type: CHECKBOX_UPDATE,
        payload: { key: 'showRecentlyClosed', value: false },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.showRecentlyClosed).to.equal(false);
    });

    it('should update enableOverlay to true', function () {
      const action = {
        type: CHECKBOX_UPDATE,
        payload: { key: 'enableOverlay', value: true },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.enableOverlay).to.equal(true);
    });

    it('should preserve other settings when updating one', function () {
      const action = {
        type: CHECKBOX_UPDATE,
        payload: { key: 'ignorePinnedTabs', value: true },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.showHistory).to.equal(initialGeneralSettings.showHistory);
      expect(result.searchAllWindows).to.equal(initialGeneralSettings.searchAllWindows);
    });
  });

  describe('NUMBER_UPDATE', function () {
    it('should update recentlyClosedLimit', function () {
      const action = {
        type: NUMBER_UPDATE,
        payload: { key: 'recentlyClosedLimit', value: '10' },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.recentlyClosedLimit).to.equal(10);
    });

    it('should parse string values to integers', function () {
      const action = {
        type: NUMBER_UPDATE,
        payload: { key: 'recentlyClosedLimit', value: '15' },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.recentlyClosedLimit).to.be.a('number');
      expect(result.recentlyClosedLimit).to.equal(15);
    });

    it('should update tabUrlSize', function () {
      const action = {
        type: NUMBER_UPDATE,
        payload: { key: 'tabUrlSize', value: '14' },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.tabUrlSize).to.equal(14);
    });

    it('should update tabTitleSize', function () {
      const action = {
        type: NUMBER_UPDATE,
        payload: { key: 'tabTitleSize', value: '16' },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.tabTitleSize).to.equal(16);
    });

    it('should preserve other settings when updating a number', function () {
      const action = {
        type: NUMBER_UPDATE,
        payload: { key: 'recentlyClosedLimit', value: '10' },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result.ignorePinnedTabs).to.equal(initialGeneralSettings.ignorePinnedTabs);
    });
  });

  describe('SETTINGS_RESET', function () {
    it('should reset all general settings to initial values', function () {
      const modifiedState = {
        ignorePinnedTabs: true,
        oneLineTabTitles: true,
        showVisualDeleteTabButton: false,
        showHistory: true,
        showBookmarks: true,
        showTabCountBadgeText: false,
        searchAllWindows: false,
        enableOverlay: true,
        showRecentlyClosed: false,
        alwaysShowRecentlyClosedAtTheBottom: false,
        recentlyClosedLimit: 20,
        useFallbackFont: true,
        showLastQueryOnPopup: true,
        shouldSortByMostRecentlyUsedOnPopup: true,
        shouldSortByMostRecentlyUsedAll: true,
        tabUrlSize: 20,
        tabTitleSize: 20,
      };
      const action = { type: SETTINGS_RESET };
      const result = generalSettingsReducer(modifiedState, action);
      expect(result).to.deep.equal(initialGeneralSettings);
    });
  });

  describe('SETTING_RESET', function () {
    it('should reset a single general setting to its initial value', function () {
      const modifiedState = { ...initialGeneralSettings, ignorePinnedTabs: true };
      const action = {
        type: SETTING_RESET,
        payload: { key: 'general.ignorePinnedTabs' },
      };
      const result = generalSettingsReducer(modifiedState, action);
      expect(result.ignorePinnedTabs).to.equal(initialGeneralSettings.ignorePinnedTabs);
    });

    it('should reset recentlyClosedLimit', function () {
      const modifiedState = { ...initialGeneralSettings, recentlyClosedLimit: 20 };
      const action = {
        type: SETTING_RESET,
        payload: { key: 'general.recentlyClosedLimit' },
      };
      const result = generalSettingsReducer(modifiedState, action);
      expect(result.recentlyClosedLimit).to.equal(initialGeneralSettings.recentlyClosedLimit);
    });

    it('should not affect other reducers keys', function () {
      const modifiedState = { ...initialGeneralSettings, ignorePinnedTabs: true };
      const action = {
        type: SETTING_RESET,
        payload: { key: 'fuzzy.threshold' },
      };
      const result = generalSettingsReducer(modifiedState, action);
      expect(result.ignorePinnedTabs).to.equal(true);
    });

    it('should return unchanged state if key does not exist in general', function () {
      const action = {
        type: SETTING_RESET,
        payload: { key: 'general.nonexistent' },
      };
      const result = generalSettingsReducer(initialGeneralSettings, action);
      expect(result).to.deep.equal(initialGeneralSettings);
    });

    it('should preserve other modified settings when resetting one', function () {
      const modifiedState = {
        ...initialGeneralSettings,
        ignorePinnedTabs: true,
        showHistory: true,
      };
      const action = {
        type: SETTING_RESET,
        payload: { key: 'general.ignorePinnedTabs' },
      };
      const result = generalSettingsReducer(modifiedState, action);
      expect(result.ignorePinnedTabs).to.equal(initialGeneralSettings.ignorePinnedTabs);
      expect(result.showHistory).to.equal(true);
    });
  });

  describe('unknown action', function () {
    it('should return the current state for unknown actions', function () {
      const state = { ...initialGeneralSettings, ignorePinnedTabs: true };
      const action = { type: 'UNKNOWN_ACTION' };
      const result = generalSettingsReducer(state, action);
      expect(result).to.deep.equal(state);
    });
  });
});
