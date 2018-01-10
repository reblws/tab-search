import { KEYBINDING_UPDATE, KEYBINDING_DEFAULT_RESET } from 'core/actions/types';
import { defaultCommands } from './defaults';

export default function keyboardConfigReducer(
  state = defaultCommands,
  action,
) {
  const { type } = action;
  switch (type) {
    case KEYBINDING_UPDATE: {
      const { command, keyBinding } = action.payload;
      return Object.assign(
        {},
        state,
        { [command]: Object.assign({}, state[command], { command: keyBinding }) },
      );
    }
    case KEYBINDING_DEFAULT_RESET:
      return defaultCommands;
    default:
      return state;
  }
}
