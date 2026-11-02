// The key hints along the bottom of the overlay, from the user's own
// shortcuts: [{ keys: ['↑', '↓'], label: 'to move' }, ...]
import keyboard, { TAB_NEXT, TAB_PREV, TAB_OPEN, TAB_DELETE } from '../keyboard';

const SYMBOLS = { Enter: '↵', Escape: 'Esc', Backspace: '⌫' };

function keyText(command, isMac) {
  if (!command) return null;
  if (typeof command === 'object' && SYMBOLS[command.key]
    && !command.ctrlKey && !command.altKey && !command.shiftKey && !command.metaKey) {
    return SYMBOLS[command.key];
  }
  return keyboard.toString(command, isMac).replace(/Backspace/, '⌫');
}

const primary = (keyboardState, action) => keyboardState[action] && keyboardState[action].command;

export function overlayHints(keyboardState = {}, isMac = false) {
  const text = action => keyText(primary(keyboardState, action), isMac);
  const hints = [
    { keys: [text(TAB_PREV), text(TAB_NEXT)].filter(Boolean), label: 'to move' },
    { keys: [text(TAB_OPEN)].filter(Boolean), label: 'to open' },
    { keys: [text(TAB_DELETE)].filter(Boolean), label: 'to close a tab' },
    { keys: ['Esc'], label: 'to dismiss' },
  ];
  return hints.filter(hint => hint.keys.length > 0);
}
