import keyboard from '../keyboard';
import { TAB_NEXT, TAB_PREV } from '../keyboard/constants';

const MODIFIERS = ['Control', 'Ctrl', 'Alt', 'Shift', 'Meta'];
// Keys whose browser default (moving focus, scrolling, submitting) the
// popup replaces with its own handling
const OVERRIDDEN_KEYS = ['Tab', 'ArrowUp', 'ArrowDown', 'Enter', 'PageDown', 'PageUp'];
const TYPING_KEY = /^([A-Za-z]|\d|Backspace)$/;

// The user's shortcuts as [kbdCommand, action] pairs, primary and secondary.
// keyboardState: { [action]: { command, secondaryCommand } }
export function commandBindings(keyboardState) {
  return ['command', 'secondaryCommand'].flatMap(slot => Object.keys(keyboardState)
    .filter(action => keyboardState[action][slot])
    .map(action => [keyboardState[action][slot], action]));
}

// What a keydown in the popup does.
// key: the event's { key, code, ctrlKey, altKey, shiftKey, metaKey }
// Returns { preventDefault, command } to run a popup command,
// { preventDefault, focus: 'first' | 'last' | 'search' } to move focus,
// or { preventDefault } alone.
export function interpretKey(key, bindings, { searchFocused }) {
  const preventDefault = MODIFIERS.includes(key.key) || OVERRIDDEN_KEYS.includes(key.key);
  if (keyboard.isValid(key)) {
    const cmd = keyboard.command(key);
    const binding = bindings.find(([bound]) => keyboard.isEqual(bound, cmd));
    return { preventDefault, command: binding && binding[1] };
  }
  switch (key.key) {
    // Outside the search input, Home and End jump to the ends of the list;
    // inside it they keep moving the caret
    case 'End':
      return searchFocused ? { preventDefault } : { preventDefault: true, focus: 'last' };
    case 'Home':
      return searchFocused ? { preventDefault } : { preventDefault: true, focus: 'first' };
    case 'PageDown':
      return { preventDefault, command: TAB_NEXT };
    case 'PageUp':
      return { preventDefault, command: TAB_PREV };
    // Tab stays inside the results instead of focusing the popup window
    case 'Tab':
      return { preventDefault, command: key.shiftKey ? TAB_PREV : TAB_NEXT };
    default:
      // Typing from a result row goes to the search input
      return TYPING_KEY.test(key.key) ? { preventDefault, focus: 'search' } : { preventDefault };
  }
}
