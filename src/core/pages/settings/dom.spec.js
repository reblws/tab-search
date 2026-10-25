import sinon from 'sinon';
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

  // One document for the whole suite: dom.js keeps the document it was
  // first imported with
  before(function () {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  });

  beforeEach(function () {
    document = dom.window.document;
    document.body.innerHTML = '';
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

  describe('formatShortcutForDisplay', function () {
    let formatShortcutForDisplay;

    beforeEach(async function () {
      const domModule = await import('./dom.js');
      formatShortcutForDisplay = domModule.formatShortcutForDisplay;
    });

    it('should correctly format MacCtrl as Ctrl on macOS', function () {
      expect(formatShortcutForDisplay('MacCtrl+Shift+F', true)).to.equal('Ctrl+Shift+F');
      expect(formatShortcutForDisplay('MacCtrl+A', true)).to.equal('Ctrl+A');
    });

    it('should correctly format Command as Cmd on macOS', function () {
      expect(formatShortcutForDisplay('Command+Shift+F', true)).to.equal('Cmd+Shift+F');
      expect(formatShortcutForDisplay('Command+A', true)).to.equal('Cmd+A');
    });

    it('should correctly format default Ctrl as Cmd on macOS', function () {
      expect(formatShortcutForDisplay('Ctrl+Shift+F', true)).to.equal('Cmd+Shift+F');
    });

    it('should keep Ctrl and Command unchanged on non-macOS', function () {
      expect(formatShortcutForDisplay('Ctrl+Shift+F', false)).to.equal('Ctrl+Shift+F');
      // Even though MacCtrl or Command shouldn't technically appear on non-macOS,
      // the formatter shouldn't manipulate them if isMac is false.
      expect(formatShortcutForDisplay('Command+Shift+F', false)).to.equal('Command+Shift+F');
      expect(formatShortcutForDisplay('MacCtrl+Shift+F', false)).to.equal('MacCtrl+Shift+F');
    });

    it('should handle empty or null shortcuts', function () {
      expect(formatShortcutForDisplay(null, true)).to.equal('');
      expect(formatShortcutForDisplay('', false)).to.equal('');
    });
  });

  describe('initBrowserShortcut without commands.update (Chrome)', function () {
    function setup(shortcut) {
      document.body.innerHTML = `
        <input type="text" id="popup-shortcut-input" readonly>
        <button id="browser-shortcut-reset"></button>
        <p id="browser-shortcut-hint"></p>`;
      browser.runtime.PlatformOs = { MAC: 'mac' };
      // Both names: action-api.js picks one from the manifest when first imported
      browser.commands = {
        getAll: sinon.stub().resolves([
          { name: '_execute_action', shortcut },
          { name: '_execute_browser_action', shortcut },
        ]),
      };
    }

    it('should explain where to change an assigned shortcut', async function () {
      setup('⌃⇧L');
      const { initBrowserShortcut } = await import('./dom.js');
      await initBrowserShortcut('mac');
      expect(document.getElementById('popup-shortcut-input').value).to.equal('⌃⇧L');
      expect(document.getElementById('browser-shortcut-hint').textContent)
        .to.equal('Chrome only lets you change this shortcut on its Keyboard shortcuts page.');
    });

    it('should explain an unassigned shortcut', async function () {
      setup('');
      const { initBrowserShortcut } = await import('./dom.js');
      await initBrowserShortcut('mac');
      expect(document.getElementById('popup-shortcut-input').value).to.equal('Not set');
      expect(document.getElementById('browser-shortcut-hint').textContent)
        .to.match(/^No shortcut is assigned.*Keyboard shortcuts page\.$/);
    });

    it('should open the browser shortcut settings from the field', async function () {
      setup('⌃⇧L');
      const { initBrowserShortcut } = await import('./dom.js');
      await initBrowserShortcut('mac');
      const input = document.getElementById('popup-shortcut-input');
      input.dispatchEvent(new dom.window.MouseEvent('click'));
      input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter' }));
      expect(browser.tabs.create.callCount).to.equal(2);
      expect(browser.tabs.create.firstCall.args[0]).to.deep.equal({ url: 'chrome://extensions/shortcuts' });
    });
  });
});
