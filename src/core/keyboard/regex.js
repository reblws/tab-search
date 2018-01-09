/* Regex patterns for interpreting commands as strings */
// Keys that can operate on their own without a modifier
import {
  CTRL,
  ALT,
  SHIFT,
  META,
} from './constants';

const validSingleKeys = [
  // /\\/ === new RegExp("\\\\") === "\"
  // eslint-disable-next-line no-useless-escape
  "[[\\]\\-=`;',\\.\/\\\\]", // punc keys
  'ArrowDown',
  'ArrowUp',
  'ArrowRight',
  'ArrowLeft',
  'Enter',
];

const requiresModifierKeys = [
  'Backspace',
  '[A-Z0-9]',
];

// Keys that are allowed at the end of a combination
const comboFinalKeys = [
  ...validSingleKeys,
  ...requiresModifierKeys,
];

// Modifier keys. If a combination has the following keys
// Don't forget to double escape slashes - /\\+/ -> /\+/
// eslint-disable-next-line no-useless-escape
const modifiers = `((?:${CTRL}|${ALT}|${SHIFT}|${META})\\+)+`;
export const kbdStringComboRe =
  new RegExp(`^${modifiers}(?:${comboFinalKeys.join('|')})$`);
export const kbdStringSingleRe =
  new RegExp(`^(?:${validSingleKeys.join('|')})$`);
export const kbdValidFinalComboKeyRe =
  new RegExp(`^^(?:${comboFinalKeys.join('|')})$`);
