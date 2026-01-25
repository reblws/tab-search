import { SHIFT, ALT, CONTROL, CTRL, META } from './constants';

const isKeyModifier = (m) =>
  m === CONTROL || m === ALT || m === META || m === CTRL || m === SHIFT;

const ARROW_UNICODE_MAP = {
  ArrowLeft: '←',
  ArrowUp: '↑',
  ArrowRight: '→',
  ArrowDown: '↓',
};

// Returns a string representation of a kbdCommand
export function kbdCommandToString(input, isMac = false) {
  if (input === null) {
    return '∅';
  }
  if (typeof input === 'string') {
    return input;
  }
  const { key, ctrlKey, altKey, shiftKey, metaKey } = input;
  const stringParts = [];
  // Show Cmd if isMac
  // Win is more recognizable than Meta
  if (metaKey && isMac) {
    stringParts.push('Cmd');
  } else if (metaKey) {
    stringParts.push('Win');
  }

  if (ctrlKey) {
    stringParts.push('Ctrl');
  }

  if (shiftKey) {
    stringParts.push('Shift');
  }

  if (altKey) {
    stringParts.push('Alt');
  }

  if (!isKeyModifier(key) && !(key in ARROW_UNICODE_MAP)) {
    stringParts.push(key.length === 1 ? key.toUpperCase() : key);
  } else {
    stringParts.push(ARROW_UNICODE_MAP[key]);
  }

  return stringParts.join(' + ');
}
