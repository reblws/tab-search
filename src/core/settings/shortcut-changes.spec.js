import keyboard, { defaultCommands, TAB_OPEN, TAB_NEXT, TAB_PIN } from '../keyboard/index.js';
import {
  commandInfo,
  recordShortcut,
  resetShortcut,
  popupShortcut,
} from './shortcuts.js';
import {
  updateKeybinding,
  updateSecondaryKeybinding,
  removeSecondaryKeybinding,
} from './actions.js';

describe('shortcut changes', function () {
  const cmd = keyboard.command;
  const withBinding = (key, binding) =>
    Object.assign({}, defaultCommands, { [key]: Object.assign({}, defaultCommands[key], binding) });

  it('should name commands from the code, not stored state', function () {
    const stored = withBinding(TAB_OPEN, { name: 'Old name' });
    expect(commandInfo(stored, TAB_OPEN).name).to.equal('Open Tab');
  });

  describe('recordShortcut', function () {
    const record = (slot, command, state = defaultCommands) =>
      recordShortcut(state, { key: TAB_OPEN, slot, command, isMac: false });

    it('should save a free combination in the slot', function () {
      expect(record('command', cmd('Alt+O'))).to.deep.equal({ dispatch: [updateKeybinding(TAB_OPEN, cmd('Alt+O'))] });
      expect(record('secondaryCommand', cmd('Alt+O')))
        .to.deep.equal({ dispatch: [updateSecondaryKeybinding(TAB_OPEN, cmd('Alt+O'))] });
    });

    it('should change nothing for the slot\'s own combination', function () {
      expect(record('command', cmd('Enter'))).to.deep.equal({ dispatch: [] });
    });

    it('should refuse a combination another action uses', function () {
      expect(record('command', cmd('ArrowDown'))).to.deep.equal({
        error: '↓ is already used by Next Tab. Press a different combination.',
      });
    });

    it('should name the other slot when the same action uses it', function () {
      const state = withBinding(TAB_OPEN, { secondaryCommand: cmd('Alt+O') });
      expect(record('command', cmd('Alt+O'), state)).to.deep.equal({
        error: 'Alt + O is already used by Open Tab\'s secondary shortcut. Press a different combination.',
      });
    });

    it('should explain an invalid combination', function () {
      const modifierOnly = cmd({ key: 'Shift', ctrlKey: true, shiftKey: true });
      expect(record('command', modifierOnly).error).to.match(/needs a key/);
    });
  });

  describe('resetShortcut', function () {
    it('should restore the default shortcuts', function () {
      const state = withBinding(TAB_PIN, { command: cmd('Alt+X') });
      const defaults = defaultCommands[TAB_PIN];
      expect(resetShortcut(state, TAB_PIN, false)).to.deep.equal({
        dispatch: [
          updateKeybinding(TAB_PIN, defaults.command),
          defaults.secondaryCommand
            ? updateSecondaryKeybinding(TAB_PIN, defaults.secondaryCommand)
            : removeSecondaryKeybinding(TAB_PIN),
        ],
      });
    });

    it('should refuse when another action took a default shortcut', function () {
      const state = withBinding(TAB_NEXT, { command: defaultCommands[TAB_PIN].command });
      expect(resetShortcut(state, TAB_PIN, false))
        .to.deep.equal({ error: 'Can\'t reset: Alt + P is used by Next Tab.' });
    });
  });

  describe('popupShortcut', function () {
    const key = mods => Object.assign({
      key: 'f', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false,
    }, mods);

    it('should build the browser shortcut', function () {
      expect(popupShortcut(key({ ctrlKey: true, shiftKey: true }), false)).to.deep.equal({ shortcut: 'Ctrl+Shift+F' });
    });

    it('should require Ctrl, Cmd or Alt', function () {
      expect(popupShortcut(key({ shiftKey: true }), false))
        .to.deep.equal({ error: 'Include Ctrl or Alt in the shortcut.' });
      expect(popupShortcut(key({}), true))
        .to.deep.equal({ error: 'Include Cmd, Ctrl or Alt in the shortcut.' });
    });
  });
});
