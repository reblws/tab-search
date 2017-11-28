import {
  alphanumerics,
  BACKSPACE,
} from './__test__/keys';
import {
  kbdCommand,
  compareKbdCommand,
} from './constructor';

const singleKey = key =>
  ({ key, ctrlKey: false, altKey: false, shiftKey: false });
describe('keyboard.constructor', function () {
  describe('kbdCommand', function () {
    describe('string inputs', function () {
      it('should handle valid single keys on their own', function () {
        expect(kbdCommand('Enter')).to.deep.equal(singleKey('Enter'));
        expect(kbdCommand('=')).to.deep.equal(singleKey('='));
        expect(kbdCommand('ArrowLeft')).to.deep.equal(singleKey('ArrowLeft'));
      });
      it('should throw a syntax error when given a single key that requires a modifier', function () {
        const commands = [...alphanumerics, BACKSPACE];
        let i;
        for (i = 0; i < commands.length; i++) {
          const key = commands[i];
          expect(function () {
            kbdCommand(key);
          }).to.throw(`${key} is not a valid command string!`);
        }
      });
      it('should interpret ctrl+single-keys', function () {
        expect(kbdCommand('Ctrl+K')).to.deep.equal({
          key: 'K',
          ctrlKey: true,
          altKey: false,
          shiftKey: false,
        });
        expect(kbdCommand('Alt+ArrowUp')).to.deep.equal({
          key: 'ArrowUp',
          ctrlKey: false,
          altKey: true,
          shiftKey: false,
        });
      });
      it('should interpret multiple modifiers properly', function () {
        expect(kbdCommand('Meta+Shift+F')).to.deep.equal({
          key: 'F',
          ctrlKey: true,
          shiftKey: true,
          altKey: false,
        });
        expect(kbdCommand('Ctrl+Alt+Z')).to.deep.equal({
          key: 'Z',
          ctrlKey: true,
          shiftKey: false,
          altKey: true,
        });
        expect(kbdCommand('Alt+Shift+`')).to.deep.equal({
          key: '`',
          ctrlKey: false,
          shiftKey: true,
          altKey: true,
        });
      });
      it('should interpret meta keys as a ctrl', function () {
        expect(kbdCommand('Meta+Z')).to.deep.equal(kbdCommand('Ctrl+Z'));
        expect(
          kbdCommand('Meta+Ctrl+Z')
        ).to.deep.equal(kbdCommand('Ctrl+Z'));
      });
      it('should handle all the default keybindings without throwing', function () {
        // Most likely candidates for default bindings
        const defaultBindings = [
          'Ctrl+Backspace',
          'Enter',
          'ArrowUp',
          'ArrowDown',
          'ArrowRight',
          'ArrowLeft',
          'Alt+R',
          'Alt+P',
          'Alt+C',
          'Alt+B',
          'Alt+Shift+D',
        ];
        let i;
        for (i = 0; i < defaultBindings.length; i++) {
          const binding = defaultBindings[i];
          expect(function () {
            kbdCommand(binding);
          }).to.not.throw();
        }
      });
    });
    describe('event inputs', function () {
      // TODO: gather event objects
    });
  });
});
