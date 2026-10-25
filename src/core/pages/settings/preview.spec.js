import { JSDOM } from 'jsdom';
import { initialGeneralSettings, initialColorSettings } from 'core/reducers/defaults';
import { previewItems, renderPreview } from './preview.js';

const general = overrides => Object.assign({}, initialGeneralSettings, overrides);

describe('settings preview', function () {
  describe('previewItems', function () {
    const types = items => items.map(i => i.type);

    it('should list open tabs and recently closed tabs by default', function () {
      expect(types(previewItems(general()))).to.deep.equal(['tab', 'tab', 'other', 'tab', 'recent']);
    });

    it('should follow the result settings', function () {
      const items = previewItems(general({
        searchAllWindows: false,
        ignorePinnedTabs: true,
        showBookmarks: true,
        showHistory: true,
        alwaysShowRecentlyClosedAtTheBottom: false,
      }));
      expect(types(items)).to.deep.equal(['tab', 'recent', 'tab', 'bookmark', 'history']);
      expect(items.some(i => i.pinned)).to.equal(false);
    });

    it('should leave out recently closed tabs when turned off or limited to 0', function () {
      expect(types(previewItems(general({ showRecentlyClosed: false })))).to.not.include('recent');
      expect(types(previewItems(general({ recentlyClosedLimit: 0 })))).to.not.include('recent');
    });
  });

  describe('renderPreview', function () {
    let document;

    beforeEach(function () {
      const dom = new JSDOM(`<!DOCTYPE html><html><body>
        <span id="preview-width"></span><span id="popupSize-value"></span>
        <span id="preview-badge"></span>
        <div id="preview-popup"><ul id="preview-list"></ul></div>
        <ul id="preview-legend"></ul></body></html>`);
      document = dom.window.document;
      global.document = document;
      global.window = dom.window;
    });

    afterEach(function () {
      delete global.document;
      delete global.window;
    });

    it('should draw the popup with the appearance settings', function () {
      renderPreview({
        general: general({ popupSize: 'xlarge', tabUrlSize: 0, oneLineTabTitles: true, showVisualDeleteTabButton: false }),
        color: Object.assign({}, initialColorSettings, { tabColor: '#123456' }),
      }, 7);
      const popup = document.getElementById('preview-popup');
      expect(popup.style.width).to.equal('500px');
      expect(popup.classList.contains('is-one-line')).to.equal(true);
      expect(document.getElementById('popupSize-value').textContent).to.equal('500');
      expect(document.querySelectorAll('.preview__url').length).to.equal(0);
      expect(document.querySelectorAll('.preview__close').length).to.equal(0);
      expect(document.querySelector('.preview__item').style.borderLeftColor).to.equal('rgb(18, 52, 86)');
      expect(document.getElementById('preview-badge').textContent).to.equal('7');
      expect(document.getElementById('preview-legend').children.length).to.equal(5);
      // jsdom has no layout, so nothing to fit
      expect(popup.style.transform).to.equal('');
      expect(document.getElementById('preview-width').textContent).to.equal('500 px wide');
    });

    it('should hide the badge when the tab count is off', function () {
      renderPreview({
        general: general({ showTabCountBadgeText: false }),
        color: initialColorSettings,
      }, 7);
      expect(document.getElementById('preview-badge').hidden).to.equal(true);
    });
  });
});
