import {
  updateCheckbox,
  updateFuzzyCheckbox,
  updateFuzzyRange,
  updateFuzzySearchKeys,
  updateNumber,
  resetSettings,
  resetSetting,
  updateLastQuery,
  updateKeybinding,
  resetDefaultKeybindings,
  updateColor,
} from './index.js';
import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  FUZZY,
  SEARCH_KEY_UPDATE,
  SETTINGS_RESET,
  SETTING_RESET,
  NUMBER_UPDATE,
  LAST_QUERY_UPDATE,
  KEYBINDING_UPDATE,
  KEYBINDING_DEFAULT_RESET,
  COLOR_UPDATE,
} from './types.js';

describe('action creators', function () {
  describe('updateCheckbox', function () {
    it('should create a CHECKBOX_UPDATE action', function () {
      const input = { payload: { key: 'showHistory', value: true } };
      const result = updateCheckbox(input);
      expect(result.type).to.equal(CHECKBOX_UPDATE);
      expect(result.payload).to.deep.equal({ key: 'showHistory', value: true });
    });

    it('should handle false value', function () {
      const input = { payload: { key: 'showHistory', value: false } };
      const result = updateCheckbox(input);
      expect(result.payload.value).to.equal(false);
    });
  });

  describe('updateFuzzyCheckbox', function () {
    it('should create a FUZZY/CHECKBOX_UPDATE action', function () {
      const input = { payload: { key: 'enableFuzzySearch', value: false } };
      const result = updateFuzzyCheckbox(input);
      expect(result.type).to.equal(FUZZY + CHECKBOX_UPDATE);
      expect(result.payload).to.deep.equal({ key: 'enableFuzzySearch', value: false });
    });
  });

  describe('updateFuzzyRange', function () {
    it('should create a FUZZY/RANGE_UPDATE action', function () {
      const input = { payload: { key: 'threshold', value: 0.3 } };
      const result = updateFuzzyRange(input);
      expect(result.type).to.equal(FUZZY + RANGE_UPDATE);
      expect(result.payload).to.deep.equal({ key: 'threshold', value: 0.3 });
    });

    it('should handle maxPatternLength', function () {
      const input = { payload: { key: 'maxPatternLength', value: 64 } };
      const result = updateFuzzyRange(input);
      expect(result.payload.key).to.equal('maxPatternLength');
      expect(result.payload.value).to.equal(64);
    });
  });

  describe('updateFuzzySearchKeys', function () {
    it('should create a FUZZY/SEARCH_KEY_UPDATE action', function () {
      const input = { payload: { value: true } };
      const result = updateFuzzySearchKeys(input);
      expect(result.type).to.equal(FUZZY + SEARCH_KEY_UPDATE);
      expect(result.payload).to.deep.equal({ key: 'keys', value: true });
    });

    it('should handle false value', function () {
      const input = { payload: { value: false } };
      const result = updateFuzzySearchKeys(input);
      expect(result.payload.value).to.equal(false);
    });
  });

  describe('updateNumber', function () {
    it('should create a NUMBER_UPDATE action', function () {
      const input = { payload: { key: 'recentlyClosedLimit', value: 10 } };
      const result = updateNumber(input);
      expect(result.type).to.equal(NUMBER_UPDATE);
      expect(result.payload).to.deep.equal({ key: 'recentlyClosedLimit', value: 10 });
    });

    it('should handle string value', function () {
      const input = { payload: { key: 'tabUrlSize', value: '14' } };
      const result = updateNumber(input);
      expect(result.payload.value).to.equal('14');
    });
  });

  describe('resetSettings', function () {
    it('should create a SETTINGS_RESET action', function () {
      const result = resetSettings();
      expect(result.type).to.equal(SETTINGS_RESET);
    });

    it('should have undefined key and value in payload', function () {
      const result = resetSettings();
      expect(result.payload).to.deep.equal({ key: undefined, value: undefined });
    });
  });

  describe('resetSetting', function () {
    it('should create a SETTING_RESET action', function () {
      const input = { payload: { key: 'general.showHistory' } };
      const result = resetSetting(input);
      expect(result.type).to.equal(SETTING_RESET);
      expect(result.payload.key).to.equal('general.showHistory');
    });

    it('should handle fuzzy settings key', function () {
      const input = { payload: { key: 'fuzzy.threshold' } };
      const result = resetSetting(input);
      expect(result.payload.key).to.equal('fuzzy.threshold');
    });

    it('should handle color settings key', function () {
      const input = { payload: { key: 'color.tabColor' } };
      const result = resetSetting(input);
      expect(result.payload.key).to.equal('color.tabColor');
    });
  });

  describe('updateLastQuery', function () {
    it('should create a LAST_QUERY_UPDATE action', function () {
      const input = { payload: { key: 'search term' } };
      const result = updateLastQuery(input);
      expect(result.type).to.equal(LAST_QUERY_UPDATE);
      expect(result.payload.key).to.equal('search term');
    });

    it('should handle empty query', function () {
      const input = { payload: { key: '' } };
      const result = updateLastQuery(input);
      expect(result.payload.key).to.equal('');
    });
  });

  describe('updateKeybinding', function () {
    it('should create a KEYBINDING_UPDATE action', function () {
      const newCommand = {
        key: 'k',
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      };
      const input = { payload: { key: 'TAB_NEXT', value: newCommand } };
      const result = updateKeybinding(input);
      expect(result.type).to.equal(KEYBINDING_UPDATE);
      expect(result.payload.key).to.equal('TAB_NEXT');
      expect(result.payload.value).to.deep.equal(newCommand);
    });
  });

  describe('resetDefaultKeybindings', function () {
    it('should create a KEYBINDING_DEFAULT_RESET action', function () {
      const result = resetDefaultKeybindings();
      expect(result.type).to.equal(KEYBINDING_DEFAULT_RESET);
    });
  });

  describe('updateColor', function () {
    it('should create a COLOR_UPDATE action', function () {
      const input = { payload: { key: 'tabColor', value: '#FF0000' } };
      const result = updateColor(input);
      expect(result.type).to.equal(COLOR_UPDATE);
      expect(result.payload).to.deep.equal({ key: 'tabColor', value: '#FF0000' });
    });

    it('should handle popupBadgeColor', function () {
      const input = { payload: { key: 'popupBadgeColor', value: '#00FF00' } };
      const result = updateColor(input);
      expect(result.payload.key).to.equal('popupBadgeColor');
      expect(result.payload.value).to.equal('#00FF00');
    });
  });
});
