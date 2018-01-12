import {
  isValidKbdCommand,
  kbdCommand,
  kbdCommandToString,
  compareKbdCommand,
} from 'core/keyboard';
import { updateKeybinding, resetKeyboardToDefaults } from './actions';
import * as Flash from './flash';
import {
  SHORTCUT_TABLE_BODY,
  SHORTCUT_TABLE_NAME,
  SHORTCUT_TABLE_SHORTCUT,
  SHORTCUT_TABLE_DESCRIPTION,
  SHORTCUT_TABLE_INPUT,
  ERROR_MSG_NOT_VALID_SINGLE_KEY,
  ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY,
  ERROR_MSG_FINAL_KEY_IS_MODIFIER,
  SHORTCUT_RESET_BUTTON_ID,
} from './constants';

const d = document;

export function clearChildNodes(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
  return node;
}

// Fills in the keyboard area of the settings page with state from current setting
export function initKeybindingTable(store) {
  const compareCommands = (x, y) => compareKbdCommand(x.command, y.command);
  const stTableBody = d.getElementById(SHORTCUT_TABLE_BODY);
  // Connect to bg-store
  const { subscribe, dispatch, getState } = store;
  const kbHandlers = keybindInputHandlers(store);
  const { keyboard: keyboardState } = getState();
  subscribe(keyBindingSubscription);

  // Prepare the table
  clearChildNodes(stTableBody);
  stateToTableRows(keyboardState, kbHandlers).forEach((trRow) => {
    stTableBody.appendChild(trRow);
  });

  // Prepare the reset button
  const resetDefaultsButton = d.getElementById(SHORTCUT_RESET_BUTTON_ID);
  resetDefaultsButton.addEventListener('click', () => {
    dispatch(resetKeyboardToDefaults());
  });

  let prevState = keyboardState;
  function keyBindingSubscription() {
    // TODO: handle duplicates
    const selectKbd = state => state().keyboard;
    const newState = selectKbd(getState);
    diffState(prevState, newState, compareCommands)
      .forEach((key) => {
        const { command: oldCommand } = prevState[key];
        const { name, command: newCommand } = newState[key];
        const msg = `
          Updated shortcut for ${name}: <${kbdCommandToString(oldCommand)}> changed to <${kbdCommandToString(newCommand)}>
        `;
        updateTableRow(key, kbdCommandToString(newCommand));
        Flash.message(msg, Flash.OK, false);
      });
    prevState = newState;
  }
}

// Returns an array of keys showing which keys differed
function diffState(obj1, obj2, compare) {
  return Object.keys(obj2).filter(key => !compare(obj1[key], obj2[key]));
}

// Given the entire keyboard-shortcut state, return an array of <tr> nodes
function stateToTableRows(keyboardState, handlers) {
  return Object.keys(keyboardState)
    .map(key => commandToTableRow(keyboardState[key], handlers));
}

// Given a row id and the table node, update that row's input node to
// display the given value
function updateTableRow(id, value) {
  const input = d.getElementById(id).firstElementChild.firstElementChild;
  input.defaultValue = value;
  input.value = value;
}

/* Output:
<tr id={KEY}>
  <td>
    {NAME}
  </td>
  <td>
    <input type="text" value={string(command)}>
  </td>
  <td>
    {description}
  </td>
</tr>
*/
// Given an object from the keyboard reducer, output a table row
// for insertion into the settings page
function commandToTableRow({ key, name, command, description }, handlers) {
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

  // Attach event listeners
  inputShortcutNode.addEventListener('blur', handlers.onInputBlur);
  inputShortcutNode.addEventListener('focus', handlers.onInputFocus);

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

function keybindInputHandlers(store) {
  return {
    onInputFocus,
    onInputBlur,
  };

  function onInputFocus(event) {
    event.currentTarget.value = 'Enter your shortcut...';
    event.currentTarget.addEventListener('keydown', onInputKeydown);
    return event;
  }

  // On blur we'll probably flash the last error message if it wasn't a valid key
  function onInputBlur(event) {
    event.currentTarget.removeEventListener('keydown', onInputKeydown);
    event.currentTarget.value = event.currentTarget.defaultValue;
  }

  function isDuplicateCommand(state, command) {
    const key = Object.values(state)
      .find(k => compareKbdCommand(k.command, command));
    return {
      key: key.key,
      isDuplicate: !!key,
    };
  }

  // Handles incoming new commands
  function onInputKeydown(event) {
    event.preventDefault();

    const { id: parentId } = event.currentTarget.parentElement.parentElement;
    const command = kbdCommand(event);
    const isValid = isValidKbdCommand(command);
    const { name } = store.getState().keyboard[parentId];

    if (isValid) {
      const { isDuplicate, key: duplicateKey } =
        isDuplicateCommand(store.getState().keyboard, command);
      if (isDuplicate && duplicateKey === parentId) {
        Flash.message(`<${kbdCommandToString(command)}> is already ${name}'s shortcut.`, Flash.WARNING);
        event.currentTarget.blur();
      } else if (isDuplicate) {
        Flash.message(`Duplicate key! <${kbdCommandToString(command)}> is ${name}'s shortcut.`, Flash.ERROR);
      } else {
        // Stop input reset race
        event.currentTarget.removeEventListener('blur', onInputBlur);
        event.currentTarget.blur();
        Flash.close();
        store.dispatch(updateKeybinding(parentId, command));
      }
    } else {
      // Then it's an error
      let flashMsg;
      switch (command.error) {
        // Warning
        case ERROR_MSG_FINAL_KEY_IS_MODIFIER:
          flashMsg = x => Flash.message(x, Flash.WARNING);
          break;
        // Error
        case ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY:
        case ERROR_MSG_NOT_VALID_SINGLE_KEY:
        default:
          flashMsg = x => Flash.message(x, Flash.ERROR);
          break;
      }
      flashMsg(`${kbdCommandToString(command)} is ${lowerCaseSentence(command.error)}`);
    }
  }
}

function lowerCaseSentence(s) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
