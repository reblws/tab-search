import {
  CONTROL,
  CTRL,
  ALT,
  SHIFT,
  META,
  ERROR_MSG_FINAL_KEY_IS_MODIFIER,
  ERROR_MSG_NOT_VALID_SINGLE_KEY,
  ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY,
} from './constants';
import {
  kbdStringComboRe,
  kbdStringSingleRe,
  kbdValidFinalComboKeyRe,
} from './regex';
import puncCodeMap from './punc-code-map.json';

const modifierPropsMap = {
  [CTRL]: 'ctrlKey',
  [ALT]: 'altKey',
  [SHIFT]: 'shiftKey',
  [META]: 'metaKey',
};

const protoKbdCommand = {
  key: null,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
};

// Returns a bool indicating whether this input is valid
export function isValidKbdCommand(input) {
  let command;
  try {
    command = kbdCommand(input);
  } catch {
    return false;
  }

  if (command.error) {
    return false;
  }
  return true;
}

// Accepts a valid command string or
export function kbdCommand(input) {
  if (typeof input === 'string') {
    return kbdCommandString(input);
  } else if (typeof input === 'object' && !Array.isArray(input)) {
    return kbdCommandEvent(input);
  }
  throw new TypeError(
    "Command input isn't the right type. KbdCommand requires a valid command string or object"
  );
}

// Retruns a kbdCommand object. Throws a SyntaxError if the string isn't valid
function kbdCommandString(inputString) {
  const isValidCommandString =
    kbdStringComboRe.test(inputString) || kbdStringSingleRe.test(inputString);
  if (!isValidCommandString) {
    throw new SyntaxError(`${inputString} is not a valid command string!`);
  }
  const stringParts = inputString.split('+');
  return stringParts.reduce((acc, key, index) => {
    if (index === stringParts.length - 1) {
      return Object.assign({}, acc, { key });
    }
    return Object.assign({}, acc, { [modifierPropsMap[key]]: true });
  }, protoKbdCommand);
}

function kbdCommandEvent(event) {
  if (!event.key) {
    throw new Error(
      `Received a falsey value for event.key! Expected a string, got ${event.key}`
    );
  }
  // If shift is pressed then the value of event.key won't reflect
  // the value of the actual key pressed.
  // e.g. Pressing Shift+. causes event.key = '>'
  //      the key value of kbdCommand should reflect the unshifted value, so
  //      we want to show the '.' when printing the command in the above example
  if (event.code && event.shiftKey && event.code in puncCodeMap) {
    const { ctrlKey, metaKey, altKey, shiftKey } = event;
    return makeKbdCommandFromEvent({
      key: puncCodeMap[event.code],
      ctrlKey,
      metaKey,
      altKey,
      shiftKey,
    });
  }
  return makeKbdCommandFromEvent(event);
}

const isSingleKey = (c) => !c.ctrlKey && !c.shiftKey && !c.altKey && !c.metaKey;
const isFinalKeyModifier = (c) =>
  c.key === CONTROL ||
  c.key === CTRL ||
  c.key === META ||
  c.key === ALT ||
  c.key === SHIFT;

function makeKbdCommandFromEvent({ key, ctrlKey, metaKey, altKey, shiftKey }) {
  const command = {
    key: capitalizeFirstLetter(key),
    ctrlKey,
    metaKey,
    altKey,
    shiftKey,
  };
  if (isSingleKey(command) && !kbdStringSingleRe.test(command.key)) {
    command.error = ERROR_MSG_NOT_VALID_SINGLE_KEY;
  } else if (!isSingleKey(command) && isFinalKeyModifier(command)) {
    command.error = ERROR_MSG_FINAL_KEY_IS_MODIFIER;
  } else if (!kbdValidFinalComboKeyRe.test(command.key)) {
    command.error = ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY;
  }
  return command;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
