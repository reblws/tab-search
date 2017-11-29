import {
  alphanumerics,
  BACKSPACE,
} from './__test__/keys';
import {
  kbdCommand,
} from './constructor';
import * as e from './__test__/events';

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
          kbdCommand('Meta+Ctrl+Z'),
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
      it('should handle a Ctrl+Shift+F event', function () {
        expect(kbdCommand(e.eventCtrlShiftF)).to.deep.equal({
          key: 'F',
          ctrlKey: true,
          shiftKey: true,
          altKey: false,
        });
      });
      it('should handle Ctrl+`', function () {
        expect(kbdCommand(e.eventCtrlBacktick)).to.deep.equal({
          key: '`',
          ctrlKey: true,
          shiftKey: false,
          altKey: false,
        });
      });
      it('should treat meta the same as Ctrl', function () {
        expect(kbdCommand(e.eventMeta1)).to.deep.equal({
          key: '1',
          ctrlKey: true,
          shiftKey: false,
          altKey: false,
        });
        expect(kbdCommand(e.eventCtrl1)).to.deep.equal(kbdCommand(e.eventMeta1));
      });
      it('should allow a valid single key', function () {
        expect(function () { kbdCommand(e.eventBracketLeft); }).to.not.throw();
        expect(kbdCommand(e.eventBracketLeft)).to.deep.equal({
          key: '[',
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
        });
      });
      it('should throw on an invalid single key', function () {
        expect(function () { kbdCommand(e.eventG); }).to.throw();
      });
    });
  });
});

