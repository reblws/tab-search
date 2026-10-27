import { defaultCommands } from '../keyboard/index.js';
import {
  formatShortcutForDisplay,
  shortcutParts,
  findBinding,
  commandsShortcut,
  suggestedShortcut,
} from './shortcuts.js';

describe('settings shortcut helpers', function () {
  describe('formatShortcutForDisplay', function () {
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
      expect(formatShortcutForDisplay('Command+Shift+F', false)).to.equal('Command+Shift+F');
      expect(formatShortcutForDisplay('MacCtrl+Shift+F', false)).to.equal('MacCtrl+Shift+F');
    });

    it('should handle empty or null shortcuts', function () {
      expect(formatShortcutForDisplay(null, true)).to.equal('');
      expect(formatShortcutForDisplay('', false)).to.equal('');
    });
  });

  describe('shortcutParts', function () {
    it('should split shortcuts into keycaps', function () {
      expect(shortcutParts('Ctrl+Shift+F')).to.deep.equal(['Ctrl', 'Shift', 'F']);
      expect(shortcutParts('⌃⇧L')).to.deep.equal(['⌃', '⇧', 'L']);
      expect(shortcutParts('F1')).to.deep.equal(['F1']);
      expect(shortcutParts('')).to.deep.equal([]);
    });
  });

  describe('findBinding', function () {
    it('should find the action and slot using a command', function () {
      expect(findBinding(defaultCommands, defaultCommands.TAB_NEXT.secondaryCommand))
        .to.deep.equal({ key: 'TAB_NEXT', slot: 'secondaryCommand' });
      expect(findBinding(defaultCommands, defaultCommands.TAB_NEXT.command, { key: 'TAB_NEXT' }))
        .to.equal(null);
    });
  });

  describe('commandsShortcut', function () {
    it('should build a browser.commands shortcut from a keydown', function () {
      expect(commandsShortcut({ ctrlKey: true, shiftKey: true, key: 'f' }, false)).to.equal('Ctrl+Shift+F');
      expect(commandsShortcut({ metaKey: true, ctrlKey: true, key: 'ArrowUp' }, true)).to.equal('Command+MacCtrl+Up');
    });
  });

  describe('suggestedShortcut', function () {
    const commands = { _execute_action: { suggested_key: { default: 'Ctrl+Shift+F', mac: 'MacCtrl+Shift+F' } } };

    it('should pick the suggested key for the platform', function () {
      expect(suggestedShortcut(commands, false)).to.equal('Ctrl+Shift+F');
      expect(suggestedShortcut(commands, true)).to.equal('MacCtrl+Shift+F');
    });

    it('should return an empty shortcut without commands', function () {
      expect(suggestedShortcut(undefined, true)).to.equal('');
    });
  });
});
