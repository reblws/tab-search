import {
  initialGeneralSettings,
  initialColorSettings,
  initialFuzzySettings,
} from '../reducers/defaults.js';
import { findSetting, popupStateChanged } from './lookup.js';

const makeState = (general = {}, extra = {}) => Object.assign({
  general: Object.assign({}, initialGeneralSettings, general),
  fuzzy: initialFuzzySettings,
  color: initialColorSettings,
  state: { lastQuery: '' },
  keyboard: {},
}, extra);

describe('settings lookup', function () {
  describe('findSetting', function () {
    it('should read a dotted path from the state', function () {
      expect(findSetting(makeState(), 'fuzzy.threshold')).to.equal(initialFuzzySettings.threshold);
      expect(findSetting(makeState(), 'missing.path')).to.equal(undefined);
    });
  });

  describe('popupStateChanged', function () {
    it('should reload the popup for settings it reads', function () {
      expect(popupStateChanged(makeState(), makeState())).to.equal(false);
      expect(popupStateChanged(makeState(), makeState({ popupSize: 'small' }))).to.equal(true);
      expect(popupStateChanged(
        makeState(),
        makeState({}, { color: Object.assign({}, initialColorSettings, { tabColor: '#123456' }) }),
      )).to.equal(true);
    });

    it('should not reload it for keyboard shortcuts', function () {
      expect(popupStateChanged(makeState(), makeState({}, { keyboard: { TAB_OPEN: {} } }))).to.equal(false);
    });
  });
});
