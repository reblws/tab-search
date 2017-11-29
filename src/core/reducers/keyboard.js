import { KEYBINDING_UPDATE } from 'core/actions/types';
import { defaultCommands } from './defaults';

export default function keyboardConfigReducer(
  state = defaultCommands,
  action,
) {
  if (action.type !== KEYBINDING_UPDATE) {
    return state;
  }
  const { command, keyBinding } = action.payload;
  return Object.assign(
    {},
    state,
    { [command]: keyBinding },
  )
}
