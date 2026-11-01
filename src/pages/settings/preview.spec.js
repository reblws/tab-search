import { JSDOM } from 'jsdom';
import {
  initialGeneralSettings,
  initialColorSettings,
  initialFuzzySettings,
} from 'core/reducers/defaults';
import { renderToolbar } from './preview.js';

const makeState = (general = {}, extra = {}) => Object.assign({
  general: Object.assign({}, initialGeneralSettings, general),
  fuzzy: initialFuzzySettings,
  color: initialColorSettings,
  state: { lastQuery: '' },
  keyboard: {},
}, extra);

describe('settings preview', function () {

  describe('renderToolbar', function () {
    let document;

    beforeEach(function () {
      document = new JSDOM(`<!DOCTYPE html><html><body>
        <span id="preview-badge"></span>
        <ul id="preview-legend"></ul></body></html>`).window.document;
      global.document = document;
    });

    afterEach(function () {
      delete global.document;
    });

    it('should draw the badge and the color legend', function () {
      renderToolbar(makeState({}, {
        color: Object.assign({}, initialColorSettings, { popupBadgeColor: '#123456' }),
      }), 7);
      const badge = document.getElementById('preview-badge');
      expect(badge.hidden).to.equal(false);
      expect(badge.textContent).to.equal('7');
      expect(badge.style.backgroundColor).to.equal('rgb(18, 52, 86)');
      expect(document.getElementById('preview-legend').children.length).to.equal(5);
    });

    it('should hide the badge when the tab count is off or unknown', function () {
      renderToolbar(makeState({ showTabCountBadgeText: false }), 7);
      expect(document.getElementById('preview-badge').hidden).to.equal(true);
      renderToolbar(makeState(), '');
      expect(document.getElementById('preview-badge').hidden).to.equal(true);
    });
  });
});
