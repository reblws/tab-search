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

// On macs the metaKey is triggered. We want them to be treated equivalently?
// So the value of the ctrlKey property should be (ctrlKey || metaKey
const modifierPropsMap = {
  [CTRL]: 'ctrlKey',
  [ALT]: 'altKey',
  [SHIFT]: 'shiftKey',
  [META]: 'ctrlKey', // Point meta key to ctrl key
};

// const modifiersArray = Object.keys(modifierPropsMap);

const protoKbdCommand = {
  key: null,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
};

// Returns a bool indicating whether this input is valid
export function isValidKbdCommand(input) {
  let command;
  try {
    command = kbdCommand(input);
  } catch (e) {
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
    "Command input isn't the right type. KbdCommand requires a valid command\
    string or object",
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
  return makeKbdCommandFromEvent(event);
}

const isSingleKey = c => (!c.ctrlKey && !c.shiftKey && !c.altKey);
const isFinalKeyModifier = c => c.key === CONTROL
  || c.key === CTRL
  || c.key === META
  || c.key === ALT
  || c.key === SHIFT;

function makeKbdCommandFromEvent({
  key,
  ctrlKey,
  metaKey,
  altKey,
  shiftKey,
}) {
  const command = {
    key: capitalizeFirstLetter(key),
    ctrlKey: ctrlKey || metaKey,
    altKey,
    shiftKey,
  };
  if (isSingleKey(command) && !kbdStringSingleRe.test(command.key)) {
    command.error = ERROR_MSG_NOT_VALID_SINGLE_KEY;
  } else if (!isSingleKey(command) && !kbdValidFinalComboKeyRe.test(command.key)) {
    command.error = ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY;
  } else if (isFinalKeyModifier(command)) {
    command.error = ERROR_MSG_FINAL_KEY_IS_MODIFIER;
  }
  return command;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

