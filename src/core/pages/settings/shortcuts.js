import keyboard, { defaultCommands } from 'core/keyboard';
import {
  updateKeybinding,
  resetKeyboardToDefaults,
  updateSecondaryKeybinding,
  removeSecondaryKeybinding,
} from './actions';
import {
  SHORTCUT_LIST_ID,
  SHORTCUT_RESET_BUTTON_ID,
  RECORDING_TEXT,
  ERROR_MSG_FINAL_KEY_IS_MODIFIER,
} from './constants';
import { el, icon, clearChildNodes, CLOSE_ICON } from './element';
import * as browserCommands from './browser-commands';

const MODIFIER_KEYS = ['Control', 'Alt', 'Shift', 'Meta'];
const SLOT_LABELS = { command: 'primary', secondaryCommand: 'secondary' };

// Shows a shortcut as keycaps inside a key slot button
export function setSlotKeys(button, parts, emptyText) {
  clearChildNodes(button);
  button.classList.remove('is-recording', 'has-error');
  button.classList.toggle('is-empty', parts.length === 0);
  if (parts.length === 0) {
    button.append(emptyText);
    return;
  }
  parts.forEach((part, i) => {
    // macOS symbols read without a plus: ⌃⇧L
    if (i > 0 && !/^[⌃⌥⇧⌘]$/u.test(parts[i - 1])) {
      button.append(el('span', { className: 'key-slot__plus', 'aria-hidden': 'true' }, '+'));
    }
    button.append(el('kbd', {}, part));
  });
}

// Turns a key slot button into a recorder: activating it waits for a key
// combination, Escape or leaving it cancels. onKey(event, { stop, fail })
// decides what the keys mean.
function makeRecorder(button, { onKey, onStart, onStop }) {
  let recording = false;

  function stop() {
    if (!recording) return;
    recording = false;
    onStop();
  }

  function start() {
    recording = true;
    clearChildNodes(button);
    button.classList.remove('is-empty', 'has-error');
    button.classList.add('is-recording');
    button.append(RECORDING_TEXT);
    onStart();
    // macOS doesn't focus buttons on click, and the keys go to the focus
    button.focus();
  }

  function fail() {
    button.classList.add('has-error');
  }

  button.addEventListener('click', () => (recording ? stop() : start()));
  button.addEventListener('blur', stop);
  button.addEventListener('keydown', (event) => {
    // Idle buttons activate as usual; Tab moves on and the blur cancels
    if (!recording || event.key === 'Tab') return;
    event.preventDefault();
    if (event.key === 'Escape') {
      stop();
      return;
    }
    if (MODIFIER_KEYS.includes(event.key)) return;
    onKey(event, { stop, fail });
  });

  return { isRecording: () => recording, stop };
}

function showError(node, message) {
  node.textContent = message;
  node.hidden = !message;
}

// Popup shortcuts ----------------------------------------------------------

const kbParts = text => (text === keyboard.toString(null) ? [] : text.split(' + '));

const isSameBinding = (x, y) => keyboard.isEqual(x.command, y.command)
  && keyboard.isEqual(x.secondaryCommand, y.secondaryCommand);

// Which action and slot already use a command, if any
export function findBinding(keyboardState, command, except = {}) {
  const keys = Object.keys(keyboardState);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const slots = Object.keys(SLOT_LABELS);
    for (let j = 0; j < slots.length; j += 1) {
      const slot = slots[j];
      const isExcepted = except.key === key && (!except.slot || except.slot === slot);
      if (!isExcepted && keyboard.isEqual(keyboardState[key][slot], command)) {
        return { key, slot };
      }
    }
  }
  return null;
}

function invalidMessage(command, text) {
  if (command.error === ERROR_MSG_FINAL_KEY_IS_MODIFIER) {
    return `${text} needs a key that isn't Ctrl, Alt, Shift or Cmd to finish it.`;
  }
  return `${text} can't be a shortcut. Try a letter or number with Ctrl, Alt or Shift.`;
}

// Display copy comes from the code so it can change; older stored state may
// carry outdated names and descriptions
function commandInfo(keyboardState, key) {
  const info = defaultCommands[key] || keyboardState[key];
  return { name: info.name, description: info.description };
}

function createShortcutRow(key, store, kbString) {
  const { getState, dispatch } = store;
  const { name, description } = commandInfo(getState().keyboard, key);
  const error = el('p', { className: 'field-error', role: 'alert', hidden: true });
  const slots = {};
  const recorders = {};

  Object.keys(SLOT_LABELS).forEach((slot) => {
    slots[slot] = el('button', { type: 'button', className: 'key-slot', dataset: { key: slot } });
  });
  const removeButton = el(
    'button',
    {
      type: 'button',
      className: 'icon-button shortcut-row__remove',
      title: `Remove secondary shortcut for ${name}`,
      'aria-label': `Remove secondary shortcut for ${name}`,
    },
    icon(CLOSE_ICON, 14, 2.4),
  );
  const resetButton = el(
    'button',
    { type: 'button', className: 'link-button', 'aria-label': `Reset ${name} to its default shortcuts` },
    'Reset',
  );

  function render() {
    const binding = getState().keyboard[key];
    Object.keys(SLOT_LABELS).forEach((slot) => {
      if (recorders[slot]?.isRecording()) return;
      const text = kbString(binding[slot]);
      const button = slots[slot];
      setSlotKeys(button, kbParts(text), '+ Add');
      button.dataset.shortcut = text;
      button.setAttribute(
        'aria-label',
        `${name} ${SLOT_LABELS[slot]} shortcut: ${binding[slot] ? text : 'none'}. Activate to change.`,
      );
    });
    removeButton.classList.toggle('is-hidden', !binding.secondaryCommand);
    resetButton.hidden = isSameBinding(binding, defaultCommands[key]);
  }

  Object.keys(SLOT_LABELS).forEach((slot) => {
    const button = slots[slot];
    recorders[slot] = makeRecorder(button, {
      onStart() {
        showError(error, '');
        button.setAttribute(
          'aria-label',
          `${name} ${SLOT_LABELS[slot]} shortcut: press the new keys, or Escape to cancel`,
        );
      },
      onStop() {
        showError(error, '');
        render();
      },
      onKey(event, { stop, fail }) {
        const command = keyboard.command(event);
        const text = kbString(command);
        if (!keyboard.isValid(command)) {
          fail();
          showError(error, invalidMessage(command, text));
          return;
        }
        const keyboardState = getState().keyboard;
        const taken = findBinding(keyboardState, command);
        if (taken && taken.key === key && taken.slot === slot) {
          stop();
        } else if (taken) {
          fail();
          const owner = taken.key === key
            ? `${name}'s ${SLOT_LABELS[taken.slot]} shortcut`
            : commandInfo(keyboardState, taken.key).name;
          showError(error, `${text} is already used by ${owner}. Press a different combination.`);
        } else {
          const update = slot === 'command' ? updateKeybinding : updateSecondaryKeybinding;
          dispatch(update(key, command));
          stop();
        }
      },
    });
  });

  removeButton.addEventListener('click', () => {
    dispatch(removeSecondaryKeybinding(key));
  });

  resetButton.addEventListener('click', () => {
    const keyboardState = getState().keyboard;
    const defaults = defaultCommands[key];
    const clash = Object.keys(SLOT_LABELS)
      .map(slot => defaults[slot])
      .filter(Boolean)
      .map(command => [command, findBinding(keyboardState, command, { key })])
      .find(([, taken]) => taken);
    if (clash) {
      const [command, taken] = clash;
      showError(error, `Can't reset: ${kbString(command)} is used by ${commandInfo(keyboardState, taken.key).name}.`);
      return;
    }
    showError(error, '');
    dispatch(updateKeybinding(key, defaults.command));
    dispatch(defaults.secondaryCommand
      ? updateSecondaryKeybinding(key, defaults.secondaryCommand)
      : removeSecondaryKeybinding(key));
  });

  const row = el(
    'div',
    { className: 'setting shortcut-row', id: key },
    el(
      'div',
      { className: 'setting__text' },
      el('div', { className: 'setting__label' }, name),
      el('p', {}, description),
    ),
    slots.command,
    el('div', { className: 'shortcut-row__secondary' }, slots.secondaryCommand, removeButton),
    el('div', { className: 'shortcut-row__reset' }, resetButton),
    error,
  );
  render();
  return { row, render };
}

// Fills in the popup shortcuts list and keeps it in sync with the store
export function initKeybindingTable(store) {
  const isMac = store.os === browser.runtime.PlatformOs.MAC;
  const kbString = x => keyboard.toString(x, isMac);
  const list = document.getElementById(SHORTCUT_LIST_ID);
  const rows = Object.keys(store.getState().keyboard)
    .map(key => createShortcutRow(key, store, kbString));

  clearChildNodes(list);
  rows.forEach(({ row }) => list.append(row));
  store.subscribe(() => rows.forEach(({ render }) => render()));

  document.getElementById(SHORTCUT_RESET_BUTTON_ID).addEventListener('click', () => {
    store.dispatch(resetKeyboardToDefaults());
  });
}

// Shortcut that opens the popup ---------------------------------------------

// Format shortcut for display, converting browser.commands format to user-friendly format
export function formatShortcutForDisplay(shortcut, isMac) {
  if (!shortcut) return '';
  if (isMac) {
    return shortcut.split('+').map((part) => {
      if (part === 'MacCtrl') return 'Ctrl';
      if (part === 'Command' || part === 'Ctrl') return 'Cmd';
      return part;
    }).join('+');
  }
  return shortcut;
}

// 'Ctrl+Shift+F' -> ['Ctrl', 'Shift', 'F']; Chrome on macOS reports '⌃⇧L'
export function shortcutParts(display) {
  if (!display) return [];
  if (display.includes('+')) return display.split('+');
  const symbols = display.match(/^([⌃⌥⇧⌘]+)(.+)$/u);
  return symbols ? [...symbols[1], symbols[2]] : [display];
}

// Builds a shortcut in browser.commands format from a keydown
function commandsShortcut(event, isMac) {
  const parts = [];
  if (isMac) {
    if (event.metaKey) parts.push('Command');
    if (event.ctrlKey) parts.push('MacCtrl');
  } else if (event.ctrlKey || event.metaKey) {
    parts.push('Ctrl');
  }
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  const keyMap = {
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    ' ': 'Space',
  };
  parts.push(keyMap[event.key] || event.key.toUpperCase());
  return parts.join('+');
}

function suggestedShortcut(isMac) {
  const commands = browser.runtime.getManifest?.()?.commands || {};
  const suggested = Object.values(commands)[0]?.suggested_key || {};
  return (isMac && suggested.mac) || suggested.default || '';
}

export async function initBrowserShortcut(os) {
  const button = document.getElementById('popup-shortcut');
  const resetButton = document.getElementById('browser-shortcut-reset');
  const hint = document.getElementById('browser-shortcut-hint');
  const error = document.getElementById('browser-shortcut-error');
  const isMac = os === browser.runtime.PlatformOs.MAC;
  const supportsUpdate = browserCommands.supportsCommandUpdate();

  let current = '';
  let loadFailed = false;
  try {
    current = await browserCommands.getPopupShortcut();
  } catch (err) {
    console.error('Failed to load popup shortcut:', err);
    loadFailed = true;
  }

  function render() {
    const display = formatShortcutForDisplay(current, isMac);
    setSlotKeys(button, shortcutParts(display), loadFailed ? 'Couldn’t load' : 'Not set');
    button.dataset.shortcut = current;
    const action = supportsUpdate ? 'Activate to change.' : 'Opens the browser’s shortcut settings.';
    button.setAttribute('aria-label', `Open TabSearch shortcut: ${display || 'not set'}. ${action}`);
    resetButton.hidden = !supportsUpdate || current === suggestedShortcut(isMac);
  }

  const openBrowserShortcutSettings = () =>
    browser.tabs.create({ url: browserCommands.getBrowserShortcutSettingsUrl() });

  if (supportsUpdate) {
    makeRecorder(button, {
      onStart() {
        showError(error, '');
        button.setAttribute('aria-label', 'Open TabSearch shortcut: press the new keys, or Escape to cancel');
      },
      onStop() {
        showError(error, '');
        render();
      },
      async onKey(event, { stop, fail }) {
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
          fail();
          showError(error, `Include ${isMac ? 'Cmd, Ctrl' : 'Ctrl'} or Alt in the shortcut.`);
          return;
        }
        const shortcut = commandsShortcut(event, isMac);
        try {
          await browserCommands.updatePopupShortcut(shortcut);
          current = shortcut;
          stop();
        } catch (e) {
          fail();
          showError(error, `Couldn’t use ${formatShortcutForDisplay(shortcut, isMac)}: ${e.message}`);
        }
      },
    });
    resetButton.addEventListener('click', async () => {
      try {
        await browserCommands.resetPopupShortcut();
        current = await browserCommands.getPopupShortcut();
        showError(error, '');
        render();
      } catch {
        showError(error, 'Couldn’t reset the shortcut.');
      }
    });
    hint.textContent = 'Works from any page.';
  } else {
    // Chrome: commands.update() doesn't exist, so the button can only take
    // you to Chrome's own shortcuts page
    button.addEventListener('click', openBrowserShortcutSettings);
    // Chrome leaves a suggested key unassigned if it collides with another
    // shortcut
    hint.textContent = current
      ? 'Chrome only lets you change this shortcut on its '
      : 'No shortcut is assigned, maybe because the default conflicts with another shortcut. Set one on Chrome\'s ';
    const link = el('a', { href: '#' }, 'Keyboard shortcuts page');
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openBrowserShortcutSettings();
    });
    hint.append(link, '.');
  }
  render();
}
