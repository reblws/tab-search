import { JSDOM } from 'jsdom';
import {
  FUZZY,
  CHECKBOX_UPDATE,
} from '../../actions/types.js';

// We need to test that configureSettingListeners dispatches the correct action
// with the correct value when a fuzzy checkbox is toggled.
// Since configureSettingListeners is not exported, we test through initSettings.

describe('settings DOM', function () {
  let dom;
  let document;

  beforeEach(function () {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    document = dom.window.document;
    global.document = document;
    global.Event = dom.window.Event;
    global.DOMParser = dom.window.DOMParser;
  });

  afterEach(function () {
    delete global.document;
    delete global.Event;
    delete global.DOMParser;
  });

  describe('fuzzy checkbox change handler', function () {
    // Regression test for settings persistence bug
    // When a fuzzy checkbox is toggled, the dispatch must include the checked value
    it('should dispatch updateFuzzyCheckbox with the checked value (true)', async function () {
      const dispatchedActions = [];
      const mockDispatch = (action) => dispatchedActions.push(action);

      // Import after setting up globals
      const { initSettings } = await import('./dom.js');

      // Create a minimal DOM structure that initSettings expects
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'enableFuzzySearch';
      checkbox.name = 'enableFuzzySearch';
      checkbox.checked = true;
      document.body.appendChild(checkbox);

      // Create a fieldset with a button (required by initSettings)
      const fieldset = document.createElement('fieldset');
      const button = document.createElement('button');
      fieldset.appendChild(button);
      document.body.appendChild(fieldset);

      // Mock store
      const mockStore = {
        getState: () => ({
          fuzzy: { enableFuzzySearch: false },
          general: {},
          color: {},
          keyboard: {},
        }),
        dispatch: mockDispatch,
      };

      // Initialize settings
      initSettings(mockStore);

      // Simulate checkbox change event
      checkbox.checked = true;
      checkbox.dispatchEvent(new dom.window.Event('change'));

      // Verify the dispatched action has the correct value
      const fuzzyAction = dispatchedActions.find(
        a => a.type === FUZZY + CHECKBOX_UPDATE
      );

      expect(fuzzyAction).to.exist;
      expect(fuzzyAction.payload.key).to.equal('enableFuzzySearch');
      expect(fuzzyAction.payload.value).to.equal(true);
    });

    it('should dispatch updateFuzzyCheckbox with the checked value (false)', async function () {
      const dispatchedActions = [];
      const mockDispatch = (action) => dispatchedActions.push(action);

      const { initSettings } = await import('./dom.js');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'enableFuzzySearch';
      checkbox.name = 'enableFuzzySearch';
      checkbox.checked = false;
      document.body.appendChild(checkbox);

      const fieldset = document.createElement('fieldset');
      const button = document.createElement('button');
      fieldset.appendChild(button);
      document.body.appendChild(fieldset);

      const mockStore = {
        getState: () => ({
          fuzzy: { enableFuzzySearch: true },
          general: {},
          color: {},
          keyboard: {},
        }),
        dispatch: mockDispatch,
      };

      initSettings(mockStore);

      // Simulate unchecking the checkbox
      checkbox.checked = false;
      checkbox.dispatchEvent(new dom.window.Event('change'));

      const fuzzyAction = dispatchedActions.find(
        a => a.type === FUZZY + CHECKBOX_UPDATE
      );

      expect(fuzzyAction).to.exist;
      expect(fuzzyAction.payload.key).to.equal('enableFuzzySearch');
      expect(fuzzyAction.payload.value).to.equal(false);
    });

    it('should dispatch updateFuzzyCheckbox with value for shouldSort checkbox', async function () {
      const dispatchedActions = [];
      const mockDispatch = (action) => dispatchedActions.push(action);

      const { initSettings } = await import('./dom.js');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'shouldSort';
      checkbox.name = 'shouldSort';
      checkbox.checked = true;
      document.body.appendChild(checkbox);

      const fieldset = document.createElement('fieldset');
      const button = document.createElement('button');
      fieldset.appendChild(button);
      document.body.appendChild(fieldset);

      const mockStore = {
        getState: () => ({
          fuzzy: { shouldSort: false },
          general: {},
          color: {},
          keyboard: {},
        }),
        dispatch: mockDispatch,
      };

      initSettings(mockStore);

      checkbox.checked = true;
      checkbox.dispatchEvent(new dom.window.Event('change'));

      const fuzzyAction = dispatchedActions.find(
        a => a.type === FUZZY + CHECKBOX_UPDATE
      );

      expect(fuzzyAction).to.exist;
      expect(fuzzyAction.payload.key).to.equal('shouldSort');
      expect(fuzzyAction.payload.value).to.equal(true);
    });
  });
});
