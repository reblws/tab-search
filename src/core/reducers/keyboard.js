import { KEYBINDING_UPDATE, KEYBINDING_DEFAULT_RESET } from 'core/actions/types';
import { defaultCommands } from './defaults';

export default function keyboardConfigReducer(
  state = defaultCommands,
  action,
) {
  const { type } = action;
  switch (type) {
    case KEYBINDING_UPDATE: {
      const { key, command } = action.payload;
      return Object.assign(
        {},
        state,
        { [key]: Object.assign({}, state[key], { command }) },
      );
    }
    case KEYBINDING_DEFAULT_RESET:
      return defaultCommands;
    default:
      return state;
  }
}
