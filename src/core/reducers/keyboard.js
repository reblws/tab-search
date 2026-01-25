import {
  KEYBINDING_UPDATE,
  KEYBINDING_DEFAULT_RESET,
  SECONDARY_KEYBINDING_REMOVE,
  SECONDARY_KEYBINDING_UPDATE,
} from 'core/actions/types';
import { defaultCommands } from './defaults';

export default function keyboardConfigReducer(state = defaultCommands, action) {
  const { type } = action;
  switch (type) {
    case SECONDARY_KEYBINDING_REMOVE: {
      const { key } = action.payload;
      return Object.assign({}, state, {
        [key]: Object.assign({}, state[key], { secondaryCommand: null }),
      });
    }
    case SECONDARY_KEYBINDING_UPDATE:
    case KEYBINDING_UPDATE: {
      const commandKey =
        type === KEYBINDING_UPDATE ? 'command' : 'secondaryCommand';
      const { key, value } = action.payload;
      return Object.assign(
        {},
        state,
        // If value is falsey then we must be on SECONDARY_KEYBINDING_REMOVE
        { [key]: Object.assign({}, state[key], { [commandKey]: value }) }
      );
    }
    case KEYBINDING_DEFAULT_RESET:
      return defaultCommands;
    default:
      return state;
  }
}
