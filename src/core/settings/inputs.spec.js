import {
  isSettingInput,
  inputDisplay,
  clampNumber,
  settingChange,
  resetActions,
  atStepLimit,
} from './inputs.js';
import {
  updateCheckbox,
  updateFuzzyCheckbox,
  updateFuzzySearchKeys,
  updateFuzzyThresholdRange,
  updateNumber,
  updateColor,
  updateSelect,
  resetSetting,
} from './actions.js';

describe('settings inputs', function () {
  const settings = {
    general: {
      showHistory: true,
      popupSize: 'large',
      tabUrlSize: 11,
      shouldSortByMostRecentlyUsedOnPopup: true,
      shouldSortByMostRecentlyUsedAll: false,
    },
    fuzzy: { threshold: 0.6, keys: ['title', 'url'] },
    color: { tabColor: '#123456' },
  };

  it('should know which inputs are settings', function () {
    expect(isSettingInput('showHistory')).to.equal(true);
    expect(isSettingInput('mruSort')).to.equal(true);
    expect(isSettingInput('search')).to.equal(false);
  });

  describe('inputDisplay', function () {
    it('should check checkboxes and radios from the stored value', function () {
      expect(inputDisplay({ name: 'showHistory', type: 'checkbox' }, settings)).to.deep.equal({ checked: true });
      expect(inputDisplay({ name: 'popupSize', type: 'radio', value: 'large' }, settings)).to.deep.equal({ checked: true });
      expect(inputDisplay({ name: 'popupSize', type: 'radio', value: 'small' }, settings)).to.deep.equal({ checked: false });
    });

    it('should check the url search box when url is a search key', function () {
      expect(inputDisplay({ name: 'showUrls', type: 'checkbox' }, settings)).to.deep.equal({ checked: true });
    });

    it('should show the threshold in tenths', function () {
      expect(inputDisplay({ name: 'threshold', type: 'range' }, settings)).to.deep.equal({ value: 6 });
    });

    it('should show numbers and colors as stored', function () {
      expect(inputDisplay({ name: 'tabUrlSize', type: 'number' }, settings)).to.deep.equal({ value: 11 });
      expect(inputDisplay({ name: 'tabColor', type: 'color' }, settings)).to.deep.equal({ value: '#123456' });
    });

    it('should check the MRU radio for the stored pair of settings', function () {
      expect(inputDisplay({ name: 'mruSort', type: 'radio', value: 'popup' }, settings)).to.deep.equal({ checked: true });
      expect(inputDisplay({ name: 'mruSort', type: 'radio', value: 'always' }, settings)).to.deep.equal({ checked: false });
    });

    it('should leave inputs without a stored value alone', function () {
      expect(inputDisplay({ name: 'showBookmarks', type: 'checkbox' }, settings)).to.equal(null);
    });
  });

  it('should clamp numbers to the limits', function () {
    expect(clampNumber('50', '1', '20')).to.equal(20);
    expect(clampNumber('-3', '1', '20')).to.equal(1);
    expect(clampNumber('7', '1', '20')).to.equal(7);
    expect(clampNumber('', '1', '20')).to.equal(null);
  });

  describe('settingChange', function () {
    const change = input => settingChange(Object.assign({ value: 'on', checked: false }, input));

    it('should dispatch general and fuzzy checkboxes', function () {
      expect(change({ name: 'showRecentlyClosed', type: 'checkbox', checked: true }))
        .to.deep.equal({ dispatch: [updateCheckbox('showRecentlyClosed', true)] });
      expect(change({ name: 'enableFuzzySearch', type: 'checkbox', checked: true }))
        .to.deep.equal({ dispatch: [updateFuzzyCheckbox('enableFuzzySearch', true)] });
      expect(change({ name: 'showUrls', type: 'checkbox', checked: false }))
        .to.deep.equal({ dispatch: [updateFuzzySearchKeys(false)] });
    });

    it('should ask for permission before turning bookmarks or history on', function () {
      expect(change({ name: 'showBookmarks', type: 'checkbox', checked: true })).to.deep.equal({
        requestPermission: 'bookmarks', onGrant: [updateCheckbox('showBookmarks', true)],
      });
      expect(change({ name: 'showHistory', type: 'checkbox', checked: false }))
        .to.deep.equal({ dispatch: [updateCheckbox('showHistory', false)] });
    });

    it('should dispatch the threshold, colors and checked radios', function () {
      expect(change({ name: 'threshold', type: 'range', value: '4' }))
        .to.deep.equal({ dispatch: [updateFuzzyThresholdRange(4)] });
      expect(change({ name: 'tabColor', type: 'color', value: '#000000' }))
        .to.deep.equal({ dispatch: [updateColor('tabColor', '#000000')] });
      expect(change({ name: 'popupSize', type: 'radio', value: 'small', checked: true }))
        .to.deep.equal({ dispatch: [updateSelect('popupSize', 'small')] });
      expect(change({ name: 'popupSize', type: 'radio', value: 'small', checked: false }))
        .to.deep.equal({ dispatch: [] });
    });

    it('should clamp a typed number, or restore an emptied one', function () {
      expect(change({ name: 'tabUrlSize', type: 'number', value: '99', min: '0', max: '20' }))
        .to.deep.equal({ value: 20, dispatch: [updateNumber('tabUrlSize', 20)] });
      expect(change({ name: 'tabUrlSize', type: 'number', value: '', min: '0', max: '20' }))
        .to.deep.equal({ restore: true });
    });

    it('should dispatch both MRU settings for the chosen option', function () {
      expect(change({ name: 'mruSort', type: 'radio', value: 'always', checked: true })).to.deep.equal({
        dispatch: [
          updateCheckbox('shouldSortByMostRecentlyUsedOnPopup', true),
          updateCheckbox('shouldSortByMostRecentlyUsedAll', true),
        ],
      });
    });
  });

  it('should reset each setting of a section once, and both MRU settings', function () {
    expect(resetActions(['popupSize', 'popupSize', 'mruSort'])).to.deep.equal([
      resetSetting('popupSize'),
      resetSetting('shouldSortByMostRecentlyUsedOnPopup'),
      resetSetting('shouldSortByMostRecentlyUsedAll'),
    ]);
  });

  it('should tell when a stepper button is at its limit', function () {
    expect(atStepLimit('-1', '1', '1', '20')).to.equal(true);
    expect(atStepLimit('-1', '2', '1', '20')).to.equal(false);
    expect(atStepLimit('1', '20', '1', '20')).to.equal(true);
    expect(atStepLimit('1', '19', '1', '20')).to.equal(false);
  });
});
