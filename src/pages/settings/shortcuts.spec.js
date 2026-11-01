import sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { defaultCommands } from 'core/keyboard';
import {
  KEYBINDING_UPDATE,
  KEYBINDING_DEFAULT_RESET,
  SECONDARY_KEYBINDING_REMOVE,
} from 'core/actions/types.js';
import {
  initKeybindingTable,
  initBrowserShortcut,
} from './shortcuts.js';

describe('settings shortcuts', function () {
  let dom;
  let document;

  beforeEach(function () {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    document = dom.window.document;
    global.document = document;
    global.Event = dom.window.Event;
    browser.runtime.PlatformOs = { MAC: 'mac' };
  });

  afterEach(function () {
    delete global.document;
    delete global.Event;
  });

  const keydown = (node, init) => {
    const event = new dom.window.KeyboardEvent('keydown', Object.assign({ cancelable: true }, init));
    node.dispatchEvent(event);
    return event;
  };

  describe('popup shortcuts list', function () {
    let state;
    let dispatched;
    let listeners;

    function setup(keyboardState = defaultCommands) {
      document.body.innerHTML = `
        <button id="shortcut-reset">Reset all</button>
        <div id="shortcut-list"></div>`;
      state = { keyboard: keyboardState };
      dispatched = [];
      listeners = [];
      initKeybindingTable({
        os: 'linux',
        getState: () => state,
        dispatch: a => dispatched.push(a),
        subscribe: l => listeners.push(l),
      });
    }

    const slot = (key, which = 'command') =>
      document.querySelector(`#${key} .key-slot[data-key="${which}"]`);
    const error = key => document.querySelector(`#${key} .field-error`);

    it('should show each binding as keycaps', function () {
      setup();
      const rows = document.querySelectorAll('.shortcut-row');
      expect(rows.length).to.equal(Object.keys(defaultCommands).length);
      const caps = [...slot('DUPLICATE_TAB_DELETE').querySelectorAll('kbd')].map(k => k.textContent);
      expect(caps).to.deep.equal(['Shift', 'Alt', 'D']);
      expect(slot('DUPLICATE_TAB_DELETE').dataset.shortcut).to.equal('Shift + Alt + D');
      expect(slot('TAB_OPEN', 'secondaryCommand').textContent).to.equal('+ Add');
    });

    it('should record a new binding', function () {
      setup();
      const button = slot('TAB_REFRESH');
      button.click();
      expect(button.textContent).to.equal('Press keys…');
      const event = keydown(button, { key: 'y', ctrlKey: true });
      expect(event.defaultPrevented).to.equal(true);
      expect(dispatched).to.have.length(1);
      expect(dispatched[0].type).to.equal(KEYBINDING_UPDATE);
      expect(dispatched[0].payload.key).to.equal('TAB_REFRESH');
      expect(dispatched[0].payload.value).to.include({ key: 'Y', ctrlKey: true });
      expect(button.classList.contains('is-recording')).to.equal(false);
    });

    it('should wait for a key after modifiers and cancel on Escape', function () {
      setup();
      const button = slot('TAB_REFRESH');
      button.click();
      keydown(button, { key: 'Control', ctrlKey: true });
      expect(button.classList.contains('is-recording')).to.equal(true);
      keydown(button, { key: 'Escape' });
      expect(button.classList.contains('is-recording')).to.equal(false);
      expect(button.dataset.shortcut).to.equal('Alt + R');
      expect(dispatched).to.deep.equal([]);
    });

    it('should refuse a combination another action uses', function () {
      setup();
      const button = slot('TAB_REFRESH');
      button.click();
      keydown(button, { key: 'p', altKey: true });
      expect(dispatched).to.deep.equal([]);
      expect(button.classList.contains('has-error')).to.equal(true);
      expect(error('TAB_REFRESH').hidden).to.equal(false);
      expect(error('TAB_REFRESH').textContent).to.equal('Alt + P is already used by Pin Tab. Press a different combination.');
    });

    it('should explain an invalid combination', function () {
      setup();
      const button = slot('TAB_REFRESH');
      button.click();
      keydown(button, { key: 'a' });
      expect(dispatched).to.deep.equal([]);
      expect(error('TAB_REFRESH').textContent).to.match(/can't be a shortcut/);
    });

    it('should remove a secondary shortcut', function () {
      setup();
      const remove = document.querySelector('#TAB_NEXT .shortcut-row__remove');
      expect(remove.getAttribute('aria-label')).to.equal('Remove secondary shortcut for Next Tab');
      expect(document.querySelector('#TAB_OPEN .shortcut-row__remove').classList.contains('is-hidden'))
        .to.equal(true);
      remove.click();
      expect(dispatched).to.deep.equal([{ type: SECONDARY_KEYBINDING_REMOVE, payload: { key: 'TAB_NEXT', value: undefined } }]);
    });

    it('should offer a per-action reset only for changed bindings', function () {
      setup();
      const reset = () => document.querySelector('#TAB_NEXT .shortcut-row__reset button');
      expect(reset().hidden).to.equal(true);
      state = {
        keyboard: Object.assign({}, defaultCommands, {
          TAB_NEXT: Object.assign({}, defaultCommands.TAB_NEXT, { secondaryCommand: null }),
        }),
      };
      listeners.forEach(l => l());
      expect(reset().hidden).to.equal(false);
      expect(slot('TAB_NEXT', 'secondaryCommand').textContent).to.equal('+ Add');
      reset().click();
      expect(dispatched.map(a => a.type)).to.deep.equal([KEYBINDING_UPDATE, 'SECONDARY_KEYBINDING_UPDATE']);
    });

    it('should reset every binding', function () {
      setup();
      document.getElementById('shortcut-reset').click();
      expect(dispatched).to.deep.equal([{ type: KEYBINDING_DEFAULT_RESET, payload: { key: undefined, value: undefined } }]);
    });
  });

  describe('initBrowserShortcut without commands.update (Chrome)', function () {
    function setup(shortcut) {
      document.body.innerHTML = `
        <button id="popup-shortcut"></button>
        <button id="browser-shortcut-reset"></button>
        <p id="browser-shortcut-hint"></p>
        <p id="browser-shortcut-error" hidden></p>`;
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
      await initBrowserShortcut('mac');
      const button = document.getElementById('popup-shortcut');
      expect(button.dataset.shortcut).to.equal('⌃⇧L');
      expect([...button.querySelectorAll('kbd')].map(k => k.textContent)).to.deep.equal(['⌃', '⇧', 'L']);
      expect(document.getElementById('browser-shortcut-reset').hidden).to.equal(true);
      expect(document.getElementById('browser-shortcut-hint').textContent)
        .to.equal('Chrome only lets you change this shortcut on its Keyboard shortcuts page.');
    });

    it('should explain an unassigned shortcut', async function () {
      setup('');
      await initBrowserShortcut('mac');
      expect(document.getElementById('popup-shortcut').textContent).to.equal('Not set');
      expect(document.getElementById('browser-shortcut-hint').textContent)
        .to.match(/^No shortcut is assigned.*Keyboard shortcuts page\.$/);
    });

    it('should open the browser shortcut settings from the button', async function () {
      setup('⌃⇧L');
      await initBrowserShortcut('mac');
      document.getElementById('popup-shortcut').click();
      expect(browser.tabs.create.callCount).to.equal(1);
      expect(browser.tabs.create.firstCall.args[0]).to.deep.equal({ url: 'chrome://extensions/shortcuts' });
    });
  });

  describe('initBrowserShortcut with commands.update (Firefox)', function () {
    beforeEach(function () {
      document.body.innerHTML = `
        <button id="popup-shortcut"></button>
        <button id="browser-shortcut-reset"></button>
        <p id="browser-shortcut-hint"></p>
        <p id="browser-shortcut-error" hidden></p>`;
      let shortcut = 'Ctrl+Shift+F';
      const getAll = sinon.stub().callsFake(() => Promise.resolve([
        { name: '_execute_action', shortcut },
        { name: '_execute_browser_action', shortcut },
      ]));
      browser.commands = {
        getAll,
        update: sinon.stub().callsFake((c) => { shortcut = c.shortcut; return Promise.resolve(); }),
        reset: sinon.stub().callsFake(() => { shortcut = 'Ctrl+Shift+F'; return Promise.resolve(); }),
      };
      browser.runtime.getBrowserInfo = sinon.stub();
    });

    it('should record a new shortcut and offer a reset', async function () {
      await initBrowserShortcut('linux');
      const button = document.getElementById('popup-shortcut');
      const reset = document.getElementById('browser-shortcut-reset');
      expect(reset.hidden).to.equal(true);
      button.click();
      keydown(button, { key: 'k', ctrlKey: true, shiftKey: true });
      await new Promise(r => setTimeout(r, 0));
      expect(browser.commands.update.firstCall.args[0].shortcut).to.equal('Ctrl+Shift+K');
      expect(button.dataset.shortcut).to.equal('Ctrl+Shift+K');
      expect(reset.hidden).to.equal(false);

      reset.click();
      await new Promise(r => setTimeout(r, 0));
      expect(button.dataset.shortcut).to.equal('Ctrl+Shift+F');
      expect(reset.hidden).to.equal(true);
    });

    it('should require a modifier', async function () {
      await initBrowserShortcut('linux');
      const button = document.getElementById('popup-shortcut');
      button.click();
      keydown(button, { key: 'k' });
      expect(browser.commands.update.called).to.equal(false);
      const error = document.getElementById('browser-shortcut-error');
      expect(error.hidden).to.equal(false);
      expect(error.textContent).to.equal('Include Ctrl or Alt in the shortcut.');
    });
  });
});
