import keyboard from 'core/keyboard';
import reducerMap from './inputs-to-reducer';
import {
  updateKeybinding,
  resetKeyboardToDefaults,
  updateFuzzyThresholdRange,
  updateCheckbox,
  updateFuzzyCheckbox,
  updateFuzzySearchKeys,
  updateNumber,
} from './actions';
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
  HINT_MSG_SHOULD_USE_MODIFIERS,
  HINT_MSG_SINGLE_KEYS,
  HINT_MSG_TRY_PUNCTUATION,
  HINT_MSG_NEED_FINAL_KEY,
} from './constants';


const d = document;

export function initSettings(store) {
  const settings = store.getState();
  const fillStateSettings = getStateSettings(settings);
  const attachEventListeners = configureSettingListeners(store.dispatch);
  const inputs = findInputs();
  Object.values(inputs).forEach(fillStateSettings);
  Object.values(inputs).forEach(attachEventListeners);
}

// Fills in the keyboard area of the settings page with state from current setting
export function initKeybindingTable(store) {
  const stTableBody = d.getElementById(SHORTCUT_TABLE_BODY);
  // Connect to bg-store
  const { subscribe, dispatch, getState } = store;
  const kbString = x =>
    keyboard.toString(x, store.os === browser.runtime.PlatformOs.MAC);
  const kbHandlers = keybindInputHandlers(store, kbString);
  const { keyboard: keyboardState } = getState();

  // Handle dom updates on state-change
  subscribe(keyBindingSubscription);

  // Prepare the table
  clearChildNodes(stTableBody);
  stateToTableRows(keyboardState, kbHandlers, kbString).forEach((trRow) => {
    stTableBody.appendChild(trRow);
  });

  // Prepare the reset button
  const resetDefaultsButton = d.getElementById(SHORTCUT_RESET_BUTTON_ID);
  resetDefaultsButton.addEventListener('click', () => {
    dispatch(resetKeyboardToDefaults());
  });

  let prevState = keyboardState;
  function keyBindingSubscription() {
    const compareCommands = (x, y) => keyboard.isEqual(x.command, y.command);
    const selectKbd = state => state().keyboard;
    const newState = selectKbd(store.getState);

    diffStateKeys(prevState, newState, compareCommands)
      .forEach((key) => {
        const { command: oldCommand } = prevState[key];
        const { name, command: newCommand } = newState[key];
        const msg = `
          ${name} shortcut updated: <${kbString(oldCommand)}> changed to <${kbString(newCommand)}>
        `;
        updateTableRow(key, kbString(newCommand));
        Flash.message(msg, Flash.OK, false);
      });
    prevState = newState;
  }
}

// Object containing input ids and their corresponding nodes
function findInputs() {
  return [...document.querySelectorAll('input')]
    .filter(({ id }) => Object.keys(reducerMap).includes(id)) // Filter out all inputs who arent in charge of a setting
    .reduce((acc, node) => Object.assign({}, acc, { [node.id]: node }), {});
}
// Given the setting object and the location we want to search, return the
// current setting value
// e.g. 'fuzzySearch.enableFuzzySearch' -> settings.fuzzySearch.enableFuzzySearch
function findSetting(settings, location) {
  const locationSplit = location.split('.');
  const hasDepth = locationSplit.length > 1;
  if (hasDepth) {
    const walkObject = (acc, key) => acc[key];
    return locationSplit.reduce(walkObject, settings);
  }
  return settings[location];
}

function getStateSettings(settings) {
  return function fillStateSettings(node) {
    const { id, type } = node;
    const stateSettingValue = findSetting(settings, reducerMap[id]);
    switch (type) {
      case 'checkbox':
        if (typeof stateSettingValue === 'boolean') {
          node.checked = stateSettingValue;
        } else if (Array.isArray(stateSettingValue)) {
          // If here this is the showUrls options, the state only stores an
          // an array of keys we're allowed to search in. The only thing
          // we can change is whether the 'url' value is present in the array
          node.checked = stateSettingValue.includes('url');
        }
        break;
      case 'number':
        node.value = stateSettingValue;
        break;
      case 'range':
        node.value = stateSettingValue * 10;
        break;
      default: break;
    }
    node.dispatchEvent(new Event('change'));
  };
}


// Decides which action to dispatch based on the input that changed
function configureSettingListeners(dispatch) {
  return function attachEventListeners(node) {
    node.addEventListener('change', (event) => {
      // Figure out which action to dispatch based on the node's props
      const {
        id,
        type,
        value,
        checked,
        validity,
      } = event.currentTarget;
      const settingsLocation = reducerMap[id].split('.');
      const settingKey = settingsLocation[settingsLocation.length - 1];
      switch (type) {
        case 'range': {
          dispatch(updateFuzzyThresholdRange(parseInt(value, 10)));
          break;
        }
        case 'checkbox': {
          if (settingKey === 'showBookmarks' || settingKey === 'showHistory') {
            const permission = settingKey.slice('show'.length).toLowerCase();
            browser.permissions.request({ permissions: [permission] })
              .then((granted) => {
                // If user declines reset the checkbox to unchecked
                if (granted) {
                  dispatch(updateCheckbox(settingKey, checked));
                } else {
                  document.getElementById(settingKey).checked = false;
                }
              });
          } else if (settingsLocation[0] === 'fuzzy' && settingKey !== 'keys') {
            dispatch(updateFuzzyCheckbox(settingKey));
          } else if (settingKey === 'keys') {
            dispatch(updateFuzzySearchKeys(checked));
          } else {
            dispatch(updateCheckbox(settingKey, checked));
          }
          break;
        }
        case 'number': {
          const {
            rangeUnderflow,
            rangeOverflow,
          } = validity;
          if (!rangeUnderflow && !rangeOverflow) {
            dispatch(updateNumber(settingKey, value));
          }
          break;
        }
        default: break;
      }
    });
  };
}

export function clearChildNodes(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
  return node;
}

// Returns an array of keys showing which keys differed
function diffStateKeys(obj1, obj2, compare) {
  return Object.keys(obj2).filter(key => !compare(obj1[key], obj2[key]));
}

// Given the entire keyboard-shortcut state, return an array of <tr> nodes
function stateToTableRows(keyboardState, handlers, kbString) {
  return Object.keys(keyboardState)
    .map(key => commandToTableRow(keyboardState[key], handlers, kbString));
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
function commandToTableRow({ key, name, command, description }, handlers, kbString) {
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
  inputShortcutNode.value = kbString(command);
  inputShortcutNode.defaultValue = kbString(command);

  // Attach event listeners
  inputShortcutNode.addEventListener('blur', handlers.onInputBlur);
  inputShortcutNode.addEventListener('focus', handlers.onInputFocus);

  // Input goes inside shortcut td node
  tdShortcutNode.appendChild(inputShortcutNode);

  const tdShortcutDescriptionNode = d.createElement('td');
  tdShortcutDescriptionNode.classList.add(SHORTCUT_TABLE_DESCRIPTION);
  tdShortcutDescriptionNode.appendChild(d.createTextNode(description));

  const trChildren = [tdNameNode, tdShortcutNode, tdShortcutDescriptionNode];
  for (let i = 0; i < trChildren.length; i += 1) {
    const child = trChildren[i];
    trNode.appendChild(child);
  }
  return trNode;
}

function keybindInputHandlers(store, kbString) {
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
      .find(k => keyboard.isEqual(k.command, command));
    if (key) {
      return { key, isDuplicate: true };
    }
    return { isDuplicate: false };
  }

  // Handles incoming new commands
  function onInputKeydown(event) {
    event.preventDefault();

    const { id: parentId } = event.currentTarget.parentElement.parentElement;
    const command = keyboard.command(event);
    const isValid = keyboard.isValid(command);
    const { name } = store.getState().keyboard[parentId];
    if (isValid) {
      const { isDuplicate, key: duplicateKey } =
        isDuplicateCommand(store.getState().keyboard, command);
      if (isDuplicate && duplicateKey === parentId) {
        Flash.message(`<${kbString(command)}> is already ${name}'s shortcut.`, Flash.WARNING);
        event.currentTarget.blur();
      } else if (isDuplicate) {
        Flash.message(`Duplicate key! <${kbString(command)}> is ${name}'s shortcut.`, Flash.ERROR);
      } else {
        // Stop input reset race
        event.currentTarget.blur();
        Flash.close();
        store.dispatch(updateKeybinding(parentId, command));
      }
    } else {
      // Then it's an error
      let flashType;
      let appendMsg;
      switch (command.error) {
        // Warning
        case ERROR_MSG_FINAL_KEY_IS_MODIFIER:
          flashType = Flash.WARNING;
          appendMsg = [HINT_MSG_NEED_FINAL_KEY];
          break;
        // Error
        case ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY:
        case ERROR_MSG_NOT_VALID_SINGLE_KEY:
        default:
          flashType = Flash.ERROR;
          appendMsg = [
            HINT_MSG_SINGLE_KEYS,
            HINT_MSG_SHOULD_USE_MODIFIERS,
            HINT_MSG_TRY_PUNCTUATION,
          ];
          break;
      }
      Flash.message(
        `${kbString(command)} is ${lowerCaseSentence(command.error)}`,
        flashType,
      );
      Flash.append(appendMsg);
    }
  }
}

function lowerCaseSentence(s) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
