import { JSDOM } from 'jsdom';
import {
  FUZZY,
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  NUMBER_UPDATE,
  SELECT_UPDATE,
  SETTING_RESET,
} from '../../actions/types.js';
import { initSettings, mruChoice, mruSettings } from './dom.js';

const FIXTURE = `
  <section id="search">
    <button type="button" data-reset>Reset</button>
    <div class="setting"><input type="checkbox" id="enableFuzzySearch" name="enableFuzzySearch"></div>
    <div class="setting" id="threshold-row" data-depends-on="enableFuzzySearch">
      <input type="range" min="1" max="9" id="threshold" name="threshold">
      <output id="threshold-value"></output>
    </div>
    <div class="setting" data-depends-on="enableFuzzySearch">
      <input type="checkbox" id="shouldSort" name="shouldSort">
    </div>
    <div class="setting"><input type="checkbox" id="showUrls" name="showUrls"></div>
  </section>
  <section id="results">
    <button type="button" data-reset>Reset</button>
    <input type="checkbox" id="showBookmarks" name="showBookmarks">
    <div class="stepper">
      <button type="button" data-step="-1">−</button>
      <input type="number" min="0" max="25" id="recentlyClosedLimit" name="recentlyClosedLimit">
      <button type="button" data-step="1">+</button>
    </div>
    <input type="radio" name="mruSort" id="mruSort-never" value="never">
    <input type="radio" name="mruSort" id="mruSort-popup" value="popup">
    <input type="radio" name="mruSort" id="mruSort-always" value="always">
  </section>
  <section id="appearance">
    <input type="radio" name="popupSize" id="popupSize-small" value="small" data-width="300">
    <input type="radio" name="popupSize" id="popupSize-medium" value="medium" data-width="355">
    <span id="popupSize-value"></span>
    <input type="color" id="tabColor" name="tabColor"><p data-hex-for="tabColor"></p>
  </section>`;

const initialState = () => ({
  fuzzy: { enableFuzzySearch: true, shouldSort: true, threshold: 0.5, keys: ['title', 'url'] },
  general: {
    showBookmarks: false,
    recentlyClosedLimit: 5,
    shouldSortByMostRecentlyUsedOnPopup: true,
    shouldSortByMostRecentlyUsedAll: false,
    popupSize: 'medium',
  },
  color: { tabColor: '#0060df' },
  keyboard: {},
});

describe('settings form', function () {
  let dom;
  let document;
  let state;
  let listeners;
  let dispatched;
  let store;

  beforeEach(function () {
    dom = new JSDOM(`<!DOCTYPE html><html><body>${FIXTURE}</body></html>`);
    document = dom.window.document;
    global.document = document;
    global.Event = dom.window.Event;
    state = initialState();
    listeners = [];
    dispatched = [];
    store = {
      getState: () => state,
      dispatch: a => dispatched.push(a),
      subscribe: l => listeners.push(l),
    };
  });

  afterEach(function () {
    delete global.document;
    delete global.Event;
  });

  const $ = id => document.getElementById(id);
  const change = (node) => {
    node.dispatchEvent(new dom.window.Event('change'));
  };

  describe('mruChoice / mruSettings', function () {
    it('should map the two booleans to one choice and back', function () {
      const cases = [
        ['never', false, false],
        ['popup', true, false],
        ['always', true, true],
      ];
      cases.forEach(([choice, onPopup, all]) => {
        const settings = {
          shouldSortByMostRecentlyUsedOnPopup: onPopup,
          shouldSortByMostRecentlyUsedAll: all,
        };
        expect(mruChoice(settings)).to.equal(choice);
        expect(mruSettings(choice)).to.deep.equal(settings);
      });
    });

    it('should treat "all" without "on popup" as never, like the popup does', function () {
      expect(mruChoice({
        shouldSortByMostRecentlyUsedOnPopup: false,
        shouldSortByMostRecentlyUsedAll: true,
      })).to.equal('never');
    });
  });

  describe('filling inputs', function () {
    it('should show the stored values without dispatching', function () {
      initSettings(store);
      expect($('enableFuzzySearch').checked).to.equal(true);
      expect($('threshold').value).to.equal('5');
      expect($('threshold-value').textContent).to.equal('0.5');
      expect($('showUrls').checked).to.equal(true);
      expect($('recentlyClosedLimit').value).to.equal('5');
      expect($('mruSort-popup').checked).to.equal(true);
      expect($('popupSize-medium').checked).to.equal(true);
      expect($('popupSize-value').textContent).to.equal('355');
      expect(document.querySelector('[data-hex-for]').textContent).to.equal('#0060df');
      expect(dispatched).to.deep.equal([]);
    });

    it('should follow state changes made elsewhere', function () {
      initSettings(store);
      state = Object.assign(initialState(), {
        fuzzy: { enableFuzzySearch: false, shouldSort: true, threshold: 0.2, keys: ['title'] },
      });
      listeners.forEach(l => l());
      expect($('enableFuzzySearch').checked).to.equal(false);
      expect($('showUrls').checked).to.equal(false);
      expect($('threshold').value).to.equal('2');
      expect($('threshold-row').classList.contains('is-disabled')).to.equal(true);
    });
  });

  describe('change handlers', function () {
    // Regression test for settings persistence bug: the dispatch must include
    // the checked value
    it('should dispatch fuzzy checkboxes with their checked value', function () {
      initSettings(store);
      [false, true].forEach((checked) => {
        $('enableFuzzySearch').checked = checked;
        change($('enableFuzzySearch'));
      });
      const actions = dispatched.filter(a => a.type === FUZZY + CHECKBOX_UPDATE);
      expect(actions.map(a => [a.payload.key, a.payload.value])).to.deep.equal([
        ['enableFuzzySearch', false],
        ['enableFuzzySearch', true],
      ]);
    });

    it('should disable dependent settings without changing their values', function () {
      initSettings(store);
      $('enableFuzzySearch').checked = false;
      change($('enableFuzzySearch'));
      expect($('threshold').disabled).to.equal(true);
      expect($('shouldSort').disabled).to.equal(true);
      expect($('shouldSort').checked).to.equal(true);
      expect(dispatched.map(a => a.payload.key)).to.deep.equal(['enableFuzzySearch']);
    });

    it('should dispatch the threshold as a fraction', function () {
      initSettings(store);
      $('threshold').value = '7';
      change($('threshold'));
      expect(dispatched).to.deep.include({ type: FUZZY + RANGE_UPDATE, payload: { key: 'threshold', value: 0.7 } });
    });

    it('should dispatch both MRU settings for the chosen option', function () {
      initSettings(store);
      $('mruSort-always').checked = true;
      change($('mruSort-always'));
      expect(dispatched).to.deep.equal([
        { type: CHECKBOX_UPDATE, payload: { key: 'shouldSortByMostRecentlyUsedOnPopup', value: true } },
        { type: CHECKBOX_UPDATE, payload: { key: 'shouldSortByMostRecentlyUsedAll', value: true } },
      ]);
    });

    it('should dispatch the popup size from its radio group', function () {
      initSettings(store);
      $('popupSize-small').checked = true;
      change($('popupSize-small'));
      expect(dispatched).to.deep.equal([
        { type: SELECT_UPDATE, payload: { key: 'popupSize', value: 'small' } },
      ]);
    });

    it('should clamp typed numbers to the input range', function () {
      initSettings(store);
      $('recentlyClosedLimit').value = '99';
      change($('recentlyClosedLimit'));
      expect($('recentlyClosedLimit').value).to.equal('25');
      expect(dispatched).to.deep.equal([
        { type: NUMBER_UPDATE, payload: { key: 'recentlyClosedLimit', value: 25 } },
      ]);
    });

    it('should step numbers with the stepper buttons and stop at the limits', function () {
      state.general.recentlyClosedLimit = 24;
      initSettings(store);
      const [down, up] = document.querySelectorAll('[data-step]');
      up.click();
      expect(dispatched.pop().payload.value).to.equal(25);
      expect(up.disabled).to.equal(true);
      expect(down.disabled).to.equal(false);
    });

    it('should ask for permission before showing bookmarks', async function () {
      browser.permissions.request.resolves(false);
      initSettings(store);
      $('showBookmarks').checked = true;
      change($('showBookmarks'));
      await Promise.resolve();
      await Promise.resolve();
      expect(browser.permissions.request.firstCall.args[0]).to.deep.equal({ permissions: ['bookmarks'] });
      expect($('showBookmarks').checked).to.equal(false);
      expect(dispatched).to.deep.equal([]);
    });
  });

  describe('reset buttons', function () {
    it('should reset every setting in their section', function () {
      initSettings(store);
      document.querySelector('#results [data-reset]').click();
      expect(dispatched.every(a => a.type === SETTING_RESET)).to.equal(true);
      expect(dispatched.map(a => a.payload.key)).to.deep.equal([
        'general.showBookmarks',
        'general.recentlyClosedLimit',
        'general.shouldSortByMostRecentlyUsedOnPopup',
        'general.shouldSortByMostRecentlyUsedAll',
      ]);
    });
  });
});
