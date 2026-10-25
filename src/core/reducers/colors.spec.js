import colorSettingsReducer from './colors.js';
import { initialColorSettings } from './defaults.js';
import {
  COLOR_UPDATE,
  SETTING_RESET,
  SETTINGS_RESET,
} from '../actions/types.js';

describe('colorSettingsReducer', function () {
  describe('initial state', function () {
    it('should return initial color settings when state is undefined', function () {
      const result = colorSettingsReducer(undefined, { type: 'UNKNOWN' });
      expect(result).to.deep.equal(initialColorSettings);
    });
  });

  describe('COLOR_UPDATE', function () {
    it('should update a specific color key', function () {
      const action = {
        type: COLOR_UPDATE,
        payload: { key: 'tabColor', value: '#FF0000' },
      };
      const result = colorSettingsReducer(initialColorSettings, action);
      expect(result.tabColor).to.equal('#FF0000');
    });

    it('should preserve other color values when updating one', function () {
      const action = {
        type: COLOR_UPDATE,
        payload: { key: 'tabColor', value: '#FF0000' },
      };
      const result = colorSettingsReducer(initialColorSettings, action);
      expect(result.otherWindowTabColor).to.equal(initialColorSettings.otherWindowTabColor);
      expect(result.recentlyClosedTabColor).to.equal(initialColorSettings.recentlyClosedTabColor);
    });

    it('should update popupBadgeColor', function () {
      const action = {
        type: COLOR_UPDATE,
        payload: { key: 'popupBadgeColor', value: '#00FF00' },
      };
      const result = colorSettingsReducer(initialColorSettings, action);
      expect(result.popupBadgeColor).to.equal('#00FF00');
    });

    it('should update bookmarkColor', function () {
      const action = {
        type: COLOR_UPDATE,
        payload: { key: 'bookmarkColor', value: '#0000FF' },
      };
      const result = colorSettingsReducer(initialColorSettings, action);
      expect(result.bookmarkColor).to.equal('#0000FF');
    });

    it('should update historyColor', function () {
      const action = {
        type: COLOR_UPDATE,
        payload: { key: 'historyColor', value: '#FFFF00' },
      };
      const result = colorSettingsReducer(initialColorSettings, action);
      expect(result.historyColor).to.equal('#FFFF00');
    });
  });

  describe('SETTING_RESET', function () {
    it('should reset a single color setting to its initial value', function () {
      const modifiedState = { ...initialColorSettings, tabColor: '#FFFFFF' };
      const action = {
        type: SETTING_RESET,
        payload: { key: 'color.tabColor' },
      };
      const result = colorSettingsReducer(modifiedState, action);
      expect(result.tabColor).to.equal(initialColorSettings.tabColor);
    });

    it('should not affect other reducers keys', function () {
      const action = {
        type: SETTING_RESET,
        payload: { key: 'general.someSetting' },
      };
      const modifiedState = { ...initialColorSettings, tabColor: '#FFFFFF' };
      const result = colorSettingsReducer(modifiedState, action);
      expect(result.tabColor).to.equal('#FFFFFF');
    });

    it('should return unchanged state if key does not exist', function () {
      const action = {
        type: SETTING_RESET,
        payload: { key: 'color.nonexistent' },
      };
      const result = colorSettingsReducer(initialColorSettings, action);
      expect(result).to.deep.equal(initialColorSettings);
    });

    it('should preserve other modified colors when resetting one', function () {
      const modifiedState = {
        ...initialColorSettings,
        tabColor: '#FFFFFF',
        bookmarkColor: '#AAAAAA',
      };
      const action = {
        type: SETTING_RESET,
        payload: { key: 'color.tabColor' },
      };
      const result = colorSettingsReducer(modifiedState, action);
      expect(result.tabColor).to.equal(initialColorSettings.tabColor);
      expect(result.bookmarkColor).to.equal('#AAAAAA');
    });
  });

  describe('SETTINGS_RESET', function () {
    it('should reset all color settings to initial values', function () {
      const modifiedState = {
        popupBadgeColor: '#AAAAAA',
        tabColor: '#BBBBBB',
        otherWindowTabColor: '#CCCCCC',
        recentlyClosedTabColor: '#DDDDDD',
        bookmarkColor: '#EEEEEE',
        historyColor: '#FFFFFF',
      };
      const action = { type: SETTINGS_RESET };
      const result = colorSettingsReducer(modifiedState, action);
      expect(result).to.deep.equal(initialColorSettings);
    });
  });

  describe('unknown action', function () {
    it('should return the current state for unknown actions', function () {
      const state = { ...initialColorSettings, tabColor: '#CUSTOM' };
      const action = { type: 'UNKNOWN_ACTION' };
      const result = colorSettingsReducer(state, action);
      expect(result).to.deep.equal(state);
    });
  });
});
