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
  resetSetting,
  updateColor,
  updateSecondaryKeybinding,
  removeSecondaryKeybinding,
  updateSelect,
} from './actions';
import {
  SHORTCUT_TABLE_BODY,
  SHORTCUT_TABLE_NAME,
  SHORTCUT_TABLE_SHORTCUT,
  SHORTCUT_TABLE_DESCRIPTION,
  SHORTCUT_TABLE_INPUT,
  SHORTCUT_TABLE_SECONDARY,
  SHORTCUT_TABLE_REMOVE,
  SHORTCUT_RESET_BUTTON_ID,
  ERROR_MSG_NOT_VALID_SINGLE_KEY,
  ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY,
  ERROR_MSG_FINAL_KEY_IS_MODIFIER,
} from './constants';
import * as Toast from './toast';
import * as browserCommands from './browser-commands';


const d = document;

export function initSettings(store) {
  const settings = store.getState();
  const fillStateSettings = getStateSettings(settings);
  const attachEventListeners = configureSettingListeners(store.dispatch);
  const inputs = findInputs();
  Object.values(inputs).forEach(fillStateSettings);
  Object.values(inputs).forEach(attachEventListeners);

  // Reset each setting
  const fieldsetButtons = [...document.querySelectorAll('fieldset')]
    .map(x => [x, x.querySelector('button')]);
  fieldsetButtons.forEach(([fieldsetNode, btn]) => {
    btn.addEventListener('click', () => {
      fieldsetNode.querySelectorAll('input, select').forEach(({ name }) => {
        store.dispatch(resetSetting(name));
      });
      location.reload(true);
    });
  });
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
    const compareCommands = (x, y) => keyboard.isEqual(x.command, y.command)
      && keyboard.isEqual(x.secondaryCommand, y.secondaryCommand);
    const selectKbd = state => state().keyboard;
    const newState = selectKbd(store.getState);
    diffStateKeys(prevState, newState, compareCommands)
      .forEach((key) => {
        const { command: newCommand, secondaryCommand: newSecondaryCommand } = newState[key];
        updateTableRow(key, kbString(newCommand), kbString(newSecondaryCommand));
      });
    prevState = newState;
  }
}

// Object containing input ids and their Handlerscorresponding nodes
function findInputs() {
  return [...document.querySelectorAll('input, select')]
    // Filter out all inputs who arent in charge of a setting
    .filter(({ id }) => id in reducerMap)
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
      case 'color':
      case 'number':
        node.value = stateSettingValue;
        break;
      case 'range':
        node.value = stateSettingValue * 10;
        break;
      case 'select-one':
        node.value = stateSettingValue;
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
            dispatch(updateFuzzyCheckbox(settingKey, checked));
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
        case 'color':
          dispatch(updateColor(settingKey, value));
          break;
        case 'select-one':
          dispatch(updateSelect(settingKey, value));
          break;
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
  const toRow = key => commandToTableRow(
    keyboardState[key],
    handlers,
    kbString,
  );
  return Object.keys(keyboardState).map(toRow);
}

// Given a row id and the table node, update that row's input node to
// display the given value
function updateTableRow(id, primaryShortcut, secondaryShortcut) {
  // Update both values at a time, even if one doesn't change
  const row = d.getElementById(id);
  row.querySelectorAll('input').forEach((input) => {
    const value = input.dataset.key === 'command'
      ? primaryShortcut
      : secondaryShortcut;
    input.defaultValue = value;
    input.value = value;
  });
  setRemoveButtonVisible(
    row.querySelector(`.${SHORTCUT_TABLE_REMOVE}`),
    secondaryShortcut !== keyboard.toString(null),
  );
}

/* Output:
<tr id={KEY}>
  <td>
    {NAME}
  </td>
  <td>
    <input type="text" value={string(command)} data-key="command">
  </td>
  <td>
    <div class="shortcut-table__secondary">
      <input type="text" value={string(command)} data-key="secondaryCommand">
      <button type="button" class="shortcut-table__remove" aria-label="Remove ...">
    </div>
  </td>
  <td>
    {description}
  </td>
</tr>
*/
// Given an object from the keyboard reducer, output a table row
// for insertion into the settings page
function commandToTableRow(
  { key, name, command, secondaryCommand, description },
  handlers,
  kbString,
) {
  const trNode = d.createElement('tr');
  trNode.setAttribute('id', key);

  const tdNameNode = d.createElement('td');
  tdNameNode.classList.add(SHORTCUT_TABLE_NAME);
  tdNameNode.appendChild(d.createTextNode(name));

  const tdShortcutNode = d.createElement('td');
  const tdSecondaryShortcutNode = d.createElement('td');
  const tds = [tdShortcutNode, tdSecondaryShortcutNode];
  tds.forEach((node) => {
    node.classList.add(SHORTCUT_TABLE_SHORTCUT);
  });

  // Shortcut input handlers
  // The secondaryInputNode should have the special property of being
  // deleteable, if deleted it should show 'No Shortcut Set'.
  // In the future, we might want to make both shortcuts deletable.
  // This would require making the secondary shortcut shift up to the
  // primary shortcuts position.
  const primaryInputNode = [d.createElement('input'), 'command'];
  const secondaryInputNode = [d.createElement('input'), 'secondaryCommand'];
  const inputs = [primaryInputNode, secondaryInputNode];
  inputs.forEach(([node, commandKey]) => {
    const isPrimary = commandKey !== 'secondaryCommand';
    node.setAttribute('type', 'text');
    node.classList.add(SHORTCUT_TABLE_INPUT);
    if (isPrimary) {
      node.value = kbString(command);
      node.defaultValue = kbString(command);
    } else {
      // Secondary case
      node.value = kbString(secondaryCommand);
      node.defaultValue = kbString(secondaryCommand);
    }
    node.dataset.key = commandKey;
    node.addEventListener('blur', handlers.onInputBlur);
    node.addEventListener('focus', handlers.onInputFocus);
    if (isPrimary) {
      tdShortcutNode.appendChild(node);
    } else {
      // Keycap and its remove button side by side
      const secondaryNode = d.createElement('div');
      secondaryNode.classList.add(SHORTCUT_TABLE_SECONDARY);
      secondaryNode.append(node, createRemoveButton(name, handlers.onSecondaryReset));
      tdSecondaryShortcutNode.append(secondaryNode);
      setRemoveButtonVisible(
        secondaryNode.lastChild,
        kbString(secondaryCommand) !== keyboard.toString(null),
      );
    }
  });

  const tdShortcutDescriptionNode = d.createElement('td');
  tdShortcutDescriptionNode.classList.add(SHORTCUT_TABLE_DESCRIPTION);
  tdShortcutDescriptionNode.appendChild(d.createTextNode(description));

  const trChildren = [
    tdNameNode,
    tdShortcutNode,
    tdSecondaryShortcutNode,
    tdShortcutDescriptionNode,
  ];
  for (let i = 0; i < trChildren.length; i += 1) {
    const child = trChildren[i];
    trNode.appendChild(child);
  }
  return trNode;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

// Ghost icon button that removes a secondary shortcut. The × is inline so
// it takes the button's currentColor (same glyph as the popup's close-tab
// button).
function createRemoveButton(shortcutName, onClick) {
  const button = d.createElement('button');
  button.type = 'button';
  button.classList.add(SHORTCUT_TABLE_REMOVE);
  const label = `Remove secondary shortcut for ${shortcutName}`;
  button.title = label;
  button.setAttribute('aria-label', label);

  const svg = d.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('viewBox', '0 0 14 14');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const path = d.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.8');
  path.setAttribute('stroke-linecap', 'round');
  svg.append(path);
  button.append(svg);

  button.addEventListener('click', onClick);
  return button;
}

// Hidden buttons keep their space so the keycaps stay aligned;
// visibility: hidden also takes them out of the tab order and a11y tree
function setRemoveButtonVisible(button, visible) {
  button.classList.toggle('hidden', !visible);
}

function keybindInputHandlers(store, kbString) {
  const onInputFocus = (event) => {
    event.currentTarget.value = 'Enter your shortcut...';
    event.currentTarget.addEventListener('keydown', onInputKeydown);
    return event;
  };

  // On blur we'll probably flash the last error message if it wasn't a valid key
  const onInputBlur = (event) => {
    event.currentTarget.removeEventListener('keydown', onInputKeydown);
    event.currentTarget.value = event.currentTarget.defaultValue;
  };

  const onSecondaryReset = (event) => {
    const { id: key } = event.currentTarget.closest('tr');
    if (key in store.getState().keyboard) {
      store.dispatch(removeSecondaryKeybinding(key));
    }
  };

  return {
    onInputFocus,
    onInputBlur,
    onSecondaryReset,
  };

  function isDuplicateCommand(state, command) {
    const key = Object.values(state)
      .find(k => keyboard.isEqual(k.command, command)
        || keyboard.isEqual(k.secondaryCommand, command),
      );

    if (key) {
      return { key, isDuplicate: true };
    }

    return { isDuplicate: false };
  }

  // Handles incoming new commands
  // Attached to dom by onInputFocus
  function onInputKeydown(event) {
    event.preventDefault();
    if (event.key === 'Escape') {
      event.currentTarget.blur();
      return;
    }
    const { id: parentId } = event.currentTarget.closest('tr');
    const command = keyboard.command(event);
    const isValid = keyboard.isValid(command);
    const { name } = store.getState().keyboard[parentId];

    if (isValid) {
      const { isDuplicate, key: duplicateKey } =
        isDuplicateCommand(store.getState().keyboard, command);

      if (isDuplicate && duplicateKey === parentId) {
        // Already this shortcut's binding
        Toast.info(`${kbString(command)} is already ${name}'s shortcut`);
        event.currentTarget.blur();
      } else if (isDuplicate) {
        // Duplicate of another shortcut
        const otherName = store.getState().keyboard[duplicateKey.name]?.name || duplicateKey.name;
        Toast.error(`${kbString(command)} is already used by ${otherName}`);
      } else {
        // Valid and unique - update the binding
        event.currentTarget.blur();
        const updateBinding =
          event.currentTarget.dataset.key === 'secondaryCommand'
            ? updateSecondaryKeybinding
            : updateKeybinding;
        store.dispatch(updateBinding(parentId, command));
        Toast.success(`${name} shortcut updated to ${kbString(command)}`);
      }
    } else {
      // Invalid key combination - show appropriate message
      const keyDisplay = kbString(command);
      switch (command.error) {
        case ERROR_MSG_FINAL_KEY_IS_MODIFIER:
          Toast.warning(`${keyDisplay} needs a non-modifier key to complete the shortcut`);
          break;
        case ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY:
        case ERROR_MSG_NOT_VALID_SINGLE_KEY:
        default:
          Toast.error(`${keyDisplay} is not a valid shortcut. Try using modifier keys (Ctrl, Alt, Shift) with a letter or number`);
          break;
      }
    }
  }
}

// Format shortcut for display, converting browser.commands format to user-friendly format
export function formatShortcutForDisplay(shortcut, isMac) {
  if (!shortcut) return '';
  if (isMac) {
    return shortcut.split('+').map(part => {
      if (part === 'MacCtrl') return 'Ctrl';
      if (part === 'Command' || part === 'Ctrl') return 'Cmd';
      return part;
    }).join('+');
  }
  return shortcut;
}

// Initialize browser shortcut section for popup activation
export async function initBrowserShortcut(os) {
  const input = d.getElementById('popup-shortcut-input');
  const resetButton = d.getElementById('browser-shortcut-reset');
  const hintElement = d.getElementById('browser-shortcut-hint');

  const isMac = os === browser.runtime.PlatformOs.MAC;
  const supportsUpdate = browserCommands.supportsCommandUpdate();

  // Load current shortcut
  let currentShortcut = '';
  try {
    currentShortcut = await browserCommands.getPopupShortcut();
    input.value = formatShortcutForDisplay(currentShortcut, isMac) || 'Not set';
  } catch (err) {
    console.error('Failed to load popup shortcut:', err);
    input.value = 'Error loading';
  }

  const openBrowserShortcutSettings = () =>
    browser.tabs.create({ url: browserCommands.getBrowserShortcutSettingsUrl() });

  function addBrowserSettingsLink(element, text = 'Or manage in browser settings') {
    const link = d.createElement('a');
    link.href = '#';
    link.textContent = text;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openBrowserShortcutSettings();
    });
    element.appendChild(link);
  }

  async function handleReset() {
    try {
      await browserCommands.resetPopupShortcut();
      const newShortcut = await browserCommands.getPopupShortcut();
      input.value = formatShortcutForDisplay(newShortcut, isMac);
      Toast.success('Popup shortcut reset to default');
    } catch {
      Toast.error('Failed to reset shortcut');
    }
  }

  if (supportsUpdate) {
    // Firefox: Enable keyboard editing
    input.removeAttribute('readonly');
    setupBrowserShortcutInput(input, isMac);
    resetButton.addEventListener('click', handleReset);
  } else {
    // Chrome: commands.update() doesn't exist, so the field can only take
    // you to Chrome's own shortcuts page
    resetButton.style.display = 'none';
    input.classList.add('shortcut-input--external');
    input.title = 'Change on Chrome\'s Keyboard shortcuts page';
    input.setAttribute('aria-describedby', hintElement.id);
    input.addEventListener('click', openBrowserShortcutSettings);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openBrowserShortcutSettings();
      }
    });
    // Chrome leaves a suggested key unassigned if it collides with another
    // shortcut
    hintElement.textContent = currentShortcut
      ? 'Chrome only lets you change this shortcut on its '
      : 'No shortcut is assigned, maybe because the default conflicts with another shortcut. Set one on Chrome\'s ';
    addBrowserSettingsLink(hintElement, 'Keyboard shortcuts page');
    hintElement.append('.');
  }
}

function setupBrowserShortcutInput(input, isMac) {
  let originalValue = '';

  input.addEventListener('focus', () => {
    originalValue = input.value;
    input.value = 'Press shortcut...';
    input.addEventListener('keydown', handleKeydown);
  });

  input.addEventListener('blur', () => {
    input.removeEventListener('keydown', handleKeydown);
    if (input.value === 'Press shortcut...') {
      input.value = originalValue;
    }
  });

  async function handleKeydown(event) {
    event.preventDefault();

    if (event.key === 'Escape') {
      input.blur();
      return;
    }

    // Ignore modifier-only presses
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
      return;
    }

    // Build shortcut string in browser.commands format
    const parts = [];
    if (isMac) {
      if (event.metaKey) parts.push('Command');
      if (event.ctrlKey) parts.push('MacCtrl');
    } else {
      if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
    }
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');

    // Map key to browser.commands format
    const keyMap = {
      ArrowUp: 'Up',
      ArrowDown: 'Down',
      ArrowLeft: 'Left',
      ArrowRight: 'Right',
    };
    const key = keyMap[event.key] || event.key.toUpperCase();
    parts.push(key);

    const shortcut = parts.join('+');

    // Validate: must have Ctrl, Cmd, or Alt modifier
    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      Toast.warning('Shortcut must include a modifier (Cmd, Ctrl, or Alt)');
      return;
    }

    try {
      await browserCommands.updatePopupShortcut(shortcut);
      const displayShortcut = formatShortcutForDisplay(shortcut, isMac);
      input.value = displayShortcut;
      originalValue = displayShortcut;
      input.blur();
      Toast.success(`Shortcut updated to ${displayShortcut}`);
    } catch (e) {
      Toast.error(`Failed to update: ${e.message}`);
    }
  }
}
