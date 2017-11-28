/* Regex patterns for interpreting commands as strings */
// Keys that can operate on their own without a modifier
const validSingleKeys = [
  // eslint-disable-next-line no-useless-escape
  "[[\]\-=`;',\.\/\\]", // punc keys
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
// eslint-disable-next-line no-useless-escape
const modifiers = '((?:Ctrl|Alt|Shift|Meta)\+)+';
export const kbdStringComboRe =
  new RegExp(`^${modifiers}(?:${comboFinalKeys.join('|')})$`);
export const kbdStringSingleRe =
  new RegExp(`^(?:${validSingleKeys.join('|')})$`);
