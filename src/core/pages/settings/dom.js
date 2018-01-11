import {
  isValidKbdCommand,
  kbdCommand,
  kbdCommandToString,
} from 'core/keyboard';
import * as Flash from './flash';
import {
  SHORTCUT_TABLE_NAME,
  SHORTCUT_TABLE_SHORTCUT,
  SHORTCUT_TABLE_DESCRIPTION,
  SHORTCUT_TABLE_INPUT,
  ERROR_MSG_NOT_VALID_SINGLE_KEY,
  ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY,
  ERROR_MSG_FINAL_KEY_IS_MODIFIER,
} from './constants';

const d = document;

// Given the entire keyboard-shortcut state, return an array of <tr> nodes
export function stateToTableRows(keyboardState) {
  return Object.keys(keyboardState)
    .map(key => commandToTableRow(keyboardState[key]));
}

// Given an object from the keyboard reducer, output a table row
// for insertion into the settings page
function commandToTableRow({ key, name, command, description }) {
  const trNode = d.createElement('tr');
  trNode.setAttribute('id', key);

  const tdNameNode = d.createElement('td');
  tdNameNode.classList.add(SHORTCUT_TABLE_NAME);
  tdNameNode.appendChild(d.createTextNode(name));

  const tdShortcutNode = d.createElement('td');
  tdShortcutNode.classList.add(SHORTCUT_TABLE_SHORTCUT);

  const inputShortcutNode = d.createElement('input');
  inputShortcutNode.setAttribute('type', 'text');
  inputShortcutNode.classList.add(SHORTCUT_TABLE_INPUT);
  inputShortcutNode.value = kbdCommandToString(command);
  inputShortcutNode.defaultValue = kbdCommandToString(command);
  inputShortcutNode.addEventListener('blur', onInputBlur);
  inputShortcutNode.addEventListener('focus', onInputFocus);

  // Input goes inside shortcut td node
  tdShortcutNode.appendChild(inputShortcutNode);

  const tdShortcutDescriptionNode = d.createElement('td');
  tdShortcutDescriptionNode.classList.add(SHORTCUT_TABLE_DESCRIPTION);
  tdShortcutDescriptionNode.appendChild(d.createTextNode(description));

  const trChildren = [tdShortcutNode, tdNameNode, tdShortcutDescriptionNode];
  for (let i = 0; i < trChildren.length; i += 1) {
    const child = trChildren[i];
    trNode.appendChild(child);
  }
  return trNode;
}

function onInputFocus(event) {
  event.currentTarget.value = 'Enter your shortcut...';
  event.currentTarget.addEventListener('keydown', onInputKeydown);
  return event;
}

// On blur we'll probably flash the last error message if it wasn't a valid key
function onInputBlur(event) {
  event.currentTarget.value = event.currentTarget.defaultValue;
  event.currentTarget.removeEventListener('keydown', onInputKeydown);
  return event;
}

// Handles incoming new commands
function onInputKeydown(event) {
  event.preventDefault();
  if (isValidKbdCommand(event)) {
    const { id: parentId } = event.currentTarget.parentElement.parentElement;
    const newCommand = kbdCommand(event);
    event.currentTarget.defaultValue = kbdCommandToString(newCommand);
    console.log(newCommand);
    // TODO: update reducer state here
    Flash.message(`Updated ${parentId} shortcut to ${kbdCommandToString(newCommand)}`, Flash.OK);
    event.currentTarget.blur();
    return;
  }
  const command = kbdCommand(event);
  let flashMsg;
  switch (command.error) {
    // Warning
    case ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY:
    case ERROR_MSG_FINAL_KEY_IS_MODIFIER:
      flashMsg = x => Flash.message(x, Flash.WARNING);
      break;
    // Error
    case ERROR_MSG_NOT_VALID_SINGLE_KEY:
      flashMsg = x => Flash.message(x, Flash.ERROR);
      break;
    default:
      flashMsg = x => Flash.message(x, Flash.OK);
      break;
  }
  flashMsg(
    command.key + ' is ' + (command.error.charAt(0).toLowerCase() + command.error.slice(1))
  );
}
