import keyboardConfigReducer from './keyboard.js';
import { defaultCommands } from './defaults.js';
import {
  KEYBINDING_UPDATE,
  KEYBINDING_DEFAULT_RESET,
  SECONDARY_KEYBINDING_REMOVE,
  SECONDARY_KEYBINDING_UPDATE,
} from '../actions/types.js';

describe('keyboardConfigReducer', function () {
  describe('initial state', function () {
    it('should return default commands when state is undefined', function () {
      const result = keyboardConfigReducer(undefined, { type: 'UNKNOWN' });
      expect(result).to.deep.equal(defaultCommands);
    });
  });

  describe('KEYBINDING_UPDATE', function () {
    it('should update the primary command for a keybinding', function () {
      const newCommand = {
        key: 'k',
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      };
      const action = {
        type: KEYBINDING_UPDATE,
        payload: { key: 'TAB_NEXT', value: newCommand },
      };
      const result = keyboardConfigReducer(defaultCommands, action);
      expect(result.TAB_NEXT.command).to.deep.equal(newCommand);
    });

    it('should preserve secondary command when updating primary', function () {
      const newCommand = {
        key: 'k',
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      };
      const action = {
        type: KEYBINDING_UPDATE,
        payload: { key: 'TAB_NEXT', value: newCommand },
      };
      const result = keyboardConfigReducer(defaultCommands, action);
      expect(result.TAB_NEXT.secondaryCommand).to.equal(defaultCommands.TAB_NEXT.secondaryCommand);
    });

    it('should preserve other keybindings when updating one', function () {
      const newCommand = {
        key: 'k',
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      };
      const action = {
        type: KEYBINDING_UPDATE,
        payload: { key: 'TAB_NEXT', value: newCommand },
      };
      const result = keyboardConfigReducer(defaultCommands, action);
      expect(result.TAB_DELETE).to.deep.equal(defaultCommands.TAB_DELETE);
    });

    it('should preserve keybinding metadata (key, name, description)', function () {
      const newCommand = { key: 'x', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
      const action = {
        type: KEYBINDING_UPDATE,
        payload: { key: 'TAB_NEXT', value: newCommand },
      };
      const result = keyboardConfigReducer(defaultCommands, action);
      expect(result.TAB_NEXT.key).to.equal(defaultCommands.TAB_NEXT.key);
      expect(result.TAB_NEXT.name).to.equal(defaultCommands.TAB_NEXT.name);
      expect(result.TAB_NEXT.description).to.equal(defaultCommands.TAB_NEXT.description);
    });
  });

  describe('SECONDARY_KEYBINDING_UPDATE', function () {
    it('should update the secondary command for a keybinding', function () {
      const newCommand = {
        key: 'm',
        ctrlKey: false,
        altKey: true,
        shiftKey: false,
        metaKey: false,
      };
      const action = {
        type: SECONDARY_KEYBINDING_UPDATE,
        payload: { key: 'TAB_NEXT', value: newCommand },
      };
      const result = keyboardConfigReducer(defaultCommands, action);
      expect(result.TAB_NEXT.secondaryCommand).to.deep.equal(newCommand);
    });

    it('should preserve primary command when updating secondary', function () {
      const newCommand = {
        key: 'm',
        ctrlKey: false,
        altKey: true,
        shiftKey: false,
        metaKey: false,
      };
      const action = {
        type: SECONDARY_KEYBINDING_UPDATE,
        payload: { key: 'TAB_NEXT', value: newCommand },
      };
      const result = keyboardConfigReducer(defaultCommands, action);
      expect(result.TAB_NEXT.command).to.deep.equal(defaultCommands.TAB_NEXT.command);
    });
  });

  describe('SECONDARY_KEYBINDING_REMOVE', function () {
    it('should set secondary command to null', function () {
      const action = {
        type: SECONDARY_KEYBINDING_REMOVE,
        payload: { key: 'TAB_NEXT' },
      };
      const result = keyboardConfigReducer(defaultCommands, action);
      expect(result.TAB_NEXT.secondaryCommand).to.be.null;
    });

    it('should preserve primary command when removing secondary', function () {
      const action = {
        type: SECONDARY_KEYBINDING_REMOVE,
        payload: { key: 'TAB_NEXT' },
      };
      const result = keyboardConfigReducer(defaultCommands, action);
      expect(result.TAB_NEXT.command).to.deep.equal(defaultCommands.TAB_NEXT.command);
    });

    it('should preserve keybinding metadata when removing secondary', function () {
      const action = {
        type: SECONDARY_KEYBINDING_REMOVE,
        payload: { key: 'TAB_NEXT' },
      };
      const result = keyboardConfigReducer(defaultCommands, action);
      expect(result.TAB_NEXT.key).to.equal(defaultCommands.TAB_NEXT.key);
      expect(result.TAB_NEXT.name).to.equal(defaultCommands.TAB_NEXT.name);
    });
  });

  describe('KEYBINDING_DEFAULT_RESET', function () {
    it('should reset all keybindings to default commands', function () {
      const modifiedState = {
        ...defaultCommands,
        TAB_NEXT: {
          ...defaultCommands.TAB_NEXT,
          command: { key: 'x', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false },
          secondaryCommand: null,
        },
      };
      const action = { type: KEYBINDING_DEFAULT_RESET };
      const result = keyboardConfigReducer(modifiedState, action);
      expect(result).to.deep.equal(defaultCommands);
    });
  });

  describe('unknown action', function () {
    it('should return the current state for unknown actions', function () {
      const modifiedState = {
        ...defaultCommands,
        TAB_NEXT: {
          ...defaultCommands.TAB_NEXT,
          command: { key: 'custom', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false },
        },
      };
      const action = { type: 'UNKNOWN_ACTION' };
      const result = keyboardConfigReducer(modifiedState, action);
      expect(result).to.deep.equal(modifiedState);
    });
  });
});
