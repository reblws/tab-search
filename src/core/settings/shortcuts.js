import keyboard, { ERROR_MSG_FINAL_KEY_IS_MODIFIER, defaultCommands } from '../keyboard';
import {
  updateKeybinding,
  updateSecondaryKeybinding,
  removeSecondaryKeybinding,
} from './actions';

export const SLOT_LABELS = { command: 'primary', secondaryCommand: 'secondary' };

// Popup shortcuts ----------------------------------------------------------

export const isSameBinding = (x, y) => keyboard.isEqual(x.command, y.command)
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

export function invalidMessage(command, text) {
  if (command.error === ERROR_MSG_FINAL_KEY_IS_MODIFIER) {
    return `${text} needs a key that isn't Ctrl, Alt, Shift or Cmd to finish it.`;
  }
  return `${text} can't be a shortcut. Try a letter or number with Ctrl, Alt or Shift.`;
}

// Display copy comes from the code so it can change; older stored state may
// carry outdated names and descriptions
export function commandInfo(keyboardState, key) {
  const info = defaultCommands[key] || keyboardState[key];
  return { name: info.name, description: info.description };
}

// What a combination recorded into an action's shortcut slot does:
// { dispatch: [action, ...] } to save it and stop recording, or { error }
// to keep recording
export function recordShortcut(keyboardState, { key, slot, command, isMac }) {
  const text = keyboard.toString(command, isMac);
  if (!keyboard.isValid(command)) return { error: invalidMessage(command, text) };
  const taken = findBinding(keyboardState, command);
  // Pressing the slot's own shortcut again changes nothing
  if (taken && taken.key === key && taken.slot === slot) return { dispatch: [] };
  if (taken) {
    const owner = taken.key === key
      ? `${commandInfo(keyboardState, key).name}'s ${SLOT_LABELS[taken.slot]} shortcut`
      : commandInfo(keyboardState, taken.key).name;
    return { error: `${text} is already used by ${owner}. Press a different combination.` };
  }
  const update = slot === 'command' ? updateKeybinding : updateSecondaryKeybinding;
  return { dispatch: [update(key, command)] };
}

// Resetting an action to its default shortcuts: { dispatch: [action, ...] },
// or { error } when another action uses one of them
export function resetShortcut(keyboardState, key, isMac) {
  const defaults = defaultCommands[key];
  const clash = Object.keys(SLOT_LABELS)
    .map(slot => defaults[slot])
    .filter(Boolean)
    .map(command => [command, findBinding(keyboardState, command, { key })])
    .find(([, taken]) => taken);
  if (clash) {
    const [command, taken] = clash;
    const owner = commandInfo(keyboardState, taken.key).name;
    return { error: `Can't reset: ${keyboard.toString(command, isMac)} is used by ${owner}.` };
  }
  return {
    dispatch: [
      updateKeybinding(key, defaults.command),
      defaults.secondaryCommand
        ? updateSecondaryKeybinding(key, defaults.secondaryCommand)
        : removeSecondaryKeybinding(key),
    ],
  };
}

// Shortcut that opens the popup ---------------------------------------------

// The browser.commands shortcut for a keydown: { shortcut }, or { error }
// when it lacks the modifier browsers require
export function popupShortcut(key, isMac) {
  if (!key.ctrlKey && !key.metaKey && !key.altKey) {
    return { error: `Include ${isMac ? 'Cmd, Ctrl' : 'Ctrl'} or Alt in the shortcut.` };
  }
  return { shortcut: commandsShortcut(key, isMac) };
}

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
export function commandsShortcut(event, isMac) {
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

// The manifest's suggested key for the popup command
export function suggestedShortcut(commands = {}, isMac) {
  const suggested = Object.values(commands)[0]?.suggested_key || {};
  return (isMac && suggested.mac) || suggested.default || '';
}
