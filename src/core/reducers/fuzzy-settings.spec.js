import fuzzySettingsReducer from './fuzzy-settings.js';
import { initialFuzzySettings } from './defaults.js';
import {
  FUZZY,
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  SEARCH_KEY_UPDATE,
  SETTINGS_RESET,
  SETTING_RESET,
} from '../actions/types.js';

describe('fuzzySettingsReducer', function () {
  describe('initial state', function () {
    it('should return initial fuzzy settings when state is undefined', function () {
      const result = fuzzySettingsReducer(undefined, { type: 'UNKNOWN' });
      expect(result).to.deep.equal(initialFuzzySettings);
    });
  });

  describe('FUZZY/SEARCH_KEY_UPDATE', function () {
    it('should set keys to title and url when value is true', function () {
      const action = {
        type: FUZZY + SEARCH_KEY_UPDATE,
        payload: { value: true },
      };
      const result = fuzzySettingsReducer(initialFuzzySettings, action);
      expect(result.keys).to.deep.equal(['title', 'url']);
    });

    it('should set keys to title only when value is false', function () {
      const action = {
        type: FUZZY + SEARCH_KEY_UPDATE,
        payload: { value: false },
      };
      const result = fuzzySettingsReducer(initialFuzzySettings, action);
      expect(result.keys).to.deep.equal(['title']);
    });

    it('should preserve other settings when updating keys', function () {
      const action = {
        type: FUZZY + SEARCH_KEY_UPDATE,
        payload: { value: false },
      };
      const result = fuzzySettingsReducer(initialFuzzySettings, action);
      expect(result.enableFuzzySearch).to.equal(initialFuzzySettings.enableFuzzySearch);
      expect(result.threshold).to.equal(initialFuzzySettings.threshold);
    });
  });

  describe('FUZZY/RANGE_UPDATE', function () {
    it('should update threshold value', function () {
      const action = {
        type: FUZZY + RANGE_UPDATE,
        payload: { key: 'threshold', value: 0.3 },
      };
      const result = fuzzySettingsReducer(initialFuzzySettings, action);
      expect(result.threshold).to.equal(0.3);
    });

    it('should update maxPatternLength', function () {
      const action = {
        type: FUZZY + RANGE_UPDATE,
        payload: { key: 'maxPatternLength', value: 64 },
      };
      const result = fuzzySettingsReducer(initialFuzzySettings, action);
      expect(result.maxPatternLength).to.equal(64);
    });

    it('should update minMatchCharLength', function () {
      const action = {
        type: FUZZY + RANGE_UPDATE,
        payload: { key: 'minMatchCharLength', value: 3 },
      };
      const result = fuzzySettingsReducer(initialFuzzySettings, action);
      expect(result.minMatchCharLength).to.equal(3);
    });
  });

  describe('FUZZY/CHECKBOX_UPDATE', function () {
    it('should update enableFuzzySearch to false', function () {
      const action = {
        type: FUZZY + CHECKBOX_UPDATE,
        payload: { key: 'enableFuzzySearch', value: false },
      };
      const result = fuzzySettingsReducer(initialFuzzySettings, action);
      expect(result.enableFuzzySearch).to.equal(false);
    });

    // Regression test for settings persistence bug
    // When updateFuzzyCheckbox is called without a value parameter,
    // it should not corrupt the state with undefined
    it('should not set value to undefined when value parameter is missing', function () {
      // This simulates the bug in dom.js:180 where updateFuzzyCheckbox(settingKey)
      // is called without passing the checked value
      const action = {
        type: FUZZY + CHECKBOX_UPDATE,
        payload: { key: 'enableFuzzySearch', value: undefined },
      };
      const result = fuzzySettingsReducer(initialFuzzySettings, action);
      // The bug causes enableFuzzySearch to become undefined, which
      // corrupts redux-persist serialization and causes settings to reset
      expect(result.enableFuzzySearch).to.not.equal(undefined);
    });

    it('should update shouldSort to false', function () {
      const action = {
        type: FUZZY + CHECKBOX_UPDATE,
        payload: { key: 'shouldSort', value: false },
      };
      const result = fuzzySettingsReducer(initialFuzzySettings, action);
      expect(result.shouldSort).to.equal(false);
    });

    it('should toggle enableFuzzySearch back to true', function () {
      const modifiedState = { ...initialFuzzySettings, enableFuzzySearch: false };
      const action = {
        type: FUZZY + CHECKBOX_UPDATE,
        payload: { key: 'enableFuzzySearch', value: true },
      };
      const result = fuzzySettingsReducer(modifiedState, action);
      expect(result.enableFuzzySearch).to.equal(true);
    });
  });

  describe('SETTINGS_RESET', function () {
    it('should reset all fuzzy settings to initial values', function () {
      const modifiedState = {
        enableFuzzySearch: false,
        shouldSort: false,
        threshold: 0.1,
        maxPatternLength: 100,
        minMatchCharLength: 5,
        keys: ['title'],
      };
      const action = { type: SETTINGS_RESET };
      const result = fuzzySettingsReducer(modifiedState, action);
      expect(result).to.deep.equal(initialFuzzySettings);
    });
  });

  describe('SETTING_RESET', function () {
    it('should reset a single fuzzy setting to its initial value', function () {
      const modifiedState = { ...initialFuzzySettings, threshold: 0.1 };
      const action = {
        type: SETTING_RESET,
        payload: { key: 'fuzzy.threshold' },
      };
      const result = fuzzySettingsReducer(modifiedState, action);
      expect(result.threshold).to.equal(initialFuzzySettings.threshold);
    });

    it('should reset enableFuzzySearch', function () {
      const modifiedState = { ...initialFuzzySettings, enableFuzzySearch: false };
      const action = {
        type: SETTING_RESET,
        payload: { key: 'fuzzy.enableFuzzySearch' },
      };
      const result = fuzzySettingsReducer(modifiedState, action);
      expect(result.enableFuzzySearch).to.equal(initialFuzzySettings.enableFuzzySearch);
    });

    it('should not affect other reducers keys', function () {
      const modifiedState = { ...initialFuzzySettings, threshold: 0.1 };
      const action = {
        type: SETTING_RESET,
        payload: { key: 'general.someSetting' },
      };
      const result = fuzzySettingsReducer(modifiedState, action);
      expect(result.threshold).to.equal(0.1);
    });

    it('should return unchanged state if key does not exist in fuzzy', function () {
      const action = {
        type: SETTING_RESET,
        payload: { key: 'fuzzy.nonexistent' },
      };
      const result = fuzzySettingsReducer(initialFuzzySettings, action);
      expect(result).to.deep.equal(initialFuzzySettings);
    });

    it('should preserve other modified settings when resetting one', function () {
      const modifiedState = {
        ...initialFuzzySettings,
        threshold: 0.1,
        enableFuzzySearch: false,
      };
      const action = {
        type: SETTING_RESET,
        payload: { key: 'fuzzy.threshold' },
      };
      const result = fuzzySettingsReducer(modifiedState, action);
      expect(result.threshold).to.equal(initialFuzzySettings.threshold);
      expect(result.enableFuzzySearch).to.equal(false);
    });
  });

  describe('unknown action', function () {
    it('should return the current state for unknown actions', function () {
      const state = { ...initialFuzzySettings, threshold: 0.2 };
      const action = { type: 'UNKNOWN_ACTION' };
      const result = fuzzySettingsReducer(state, action);
      expect(result).to.deep.equal(state);
    });
  });
});
