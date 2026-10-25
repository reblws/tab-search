import {
  alphanumerics,
  BACKSPACE,
  modifiers,
} from './__test__/keys';
import {
  kbdCommand,
  isValidKbdCommand,
} from './constructor';
import {
  defaultCommands,
} from './defaults';
import { kbdCommandToString } from './to-string';
import * as constants from './constants';
import * as e from './__test__/events';

const singleKey = key =>
  ({ key, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false });
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
          metaKey: false,
        });
        expect(kbdCommand('Alt+ArrowUp')).to.deep.equal({
          key: 'ArrowUp',
          ctrlKey: false,
          altKey: true,
          shiftKey: false,
          metaKey: false,
        });
      });
      it('should interpret multiple modifiers properly', function () {
        expect(kbdCommand('Meta+Shift+F')).to.deep.equal({
          key: 'F',
          ctrlKey: false,
          shiftKey: true,
          altKey: false,
          metaKey: true,
        });
        expect(kbdCommand('Ctrl+Alt+Z')).to.deep.equal({
          key: 'Z',
          ctrlKey: true,
          shiftKey: false,
          altKey: true,
          metaKey: false,
        });
        expect(kbdCommand('Alt+Shift+`')).to.deep.equal({
          key: '`',
          ctrlKey: false,
          shiftKey: true,
          altKey: true,
          metaKey: false,
        });
      });
      it('should NOT interpret meta keys as a ctrl', function () {
        const metaZ = kbdCommand('Meta+Z');
        expect(metaZ).to.not.deep.equal(kbdCommand('Ctrl+Z'));
        expect(
          kbdCommand('Meta+Ctrl+Z'),
        ).to.not.deep.equal(kbdCommand('Ctrl+Z'));
        expect(metaZ).to.deep.equal({
          key: 'Z',
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          metaKey: true,
        });
      });

      describe('default keybindings', function () {
        const defaultBindings =
          Object.values(defaultCommands)
            .map(x => x.command);
        for (const binding of defaultBindings) {
          it(`should have no errors on ${kbdCommandToString(binding)}`, function () {
            expect(kbdCommand(binding)).to.not.have.property('error');
          });
        }
      });
    });
    describe('event inputs', function () {
      it('should return with an error key on an invalid final key <F1>', function () {
        expect(kbdCommand({ key: 'F1' })).to.have.property('error', constants.ERROR_MSG_NOT_VALID_SINGLE_KEY);
        expect(kbdCommand({ ctrlKey: true, key: 'F1' })).to.have.property('error', constants.ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY);
      });
      it('should handle a Ctrl+Shift+F event', function () {
        expect(kbdCommand(e.eventCtrlShiftF)).to.deep.equal({
          key: 'F',
          ctrlKey: true,
          shiftKey: true,
          altKey: false,
          metaKey: false,
        });
      });
      it('should handle Ctrl+`', function () {
        expect(kbdCommand(e.eventCtrlBacktick)).to.deep.equal({
          key: '`',
          ctrlKey: true,
          shiftKey: false,
          altKey: false,
          metaKey: false,
        });
      });
      it('should NOT treat Meta the same as Ctrl', function () {
        expect(kbdCommand(e.eventCtrl1))
          .to.not.deep.equal(kbdCommand(e.eventMeta1));
      });
      it('should not have errors on meta', function () {
        expect(kbdCommand(e.eventMeta1)).to.not.have.property('error');
      });
      it('should allow a valid single key <[>', function () {
        expect(kbdCommand(e.eventBracketLeft)).to.not.have.property('error');
        expect(kbdCommand(e.eventBracketLeft)).to.deep.equal({
          key: '[',
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          metaKey: false,
        });
      });
      it('should allow a valid single key <Enter>', function () {
        expect(kbdCommand(e.eventEnter).error).to.be.undefined;
        expect(kbdCommand(e.eventEnter)).to.deep.equal(singleKey('Enter'));
      });
      it('should have an error key on an invalid single key', function () {
        expect(kbdCommand(e.eventG).error).to.not.be.undefined;
      });
    });
  });
  describe('isValidKbdCommand', function () {
    it('should reject null inputs', function () {
      expect(isValidKbdCommand(null)).to.be.false;
    });

    describe('all reducer defaults pass true', function () {
      const commands = Object.values(defaultCommands);
      for (const command of commands) {
        it(`should return true for ${command.key}`, function () {
          expect(isValidKbdCommand(command.command)).to.be.true;
        });
      }
    });
    describe('modifiers', function () {
      describe('handling all single modifier keys', function () {
        for (const m of modifiers) {
          const ctrlKey = /ctrl/i.test(m);
          const shiftKey = /shift/i.test(m);
          const altKey = /alt/i.test(m);
          const metaKey = /meta/i.test(m);
          it(`should return false for ${m}`, function () {
            expect(isValidKbdCommand({
              key: m,
              ctrlKey,
              shiftKey,
              altKey,
              metaKey,
            })).to.be.false;
          });
        }
      });
    });
  });
});

