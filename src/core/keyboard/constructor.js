import {
  CTRL,
  ALT,
  SHIFT,
  META,
} from './constants';
import {
  kbdStringComboRe,
  kbdStringSingleRe,
} from './regex';

// On macs the metaKey is triggered. We want them to be treated equivalently?
// So the value of the ctrlKey property should be (ctrlKey || metaKey
const modifierPropsMap = {
  [CTRL]: 'ctrlKey',
  [ALT]: 'altKey',
  [SHIFT]: 'shiftKey',
  [META]: 'ctrlKey', // Point meta key to ctrl key
};

const modifiersArray = Object.keys(modifierPropsMap);

const kbdCommandProps = [
  'key',
  'ctrlKey',
  'altKey',
  'shiftKey',
];

const protoKbdCommand = {
  key: null,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
};

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
  if (!kbdCommandProps.all(k => !!event[k])) {
    throw new Error('Command input does not contain the required props!');
  }
  return kbdCommandProps.reduce((acc, k) =>
    Object.assign(
      {},
      acc,
      { [k === 'metaKey' ? 'ctrlKey' : k]: event[k] },
    ),
  protoKbdCommand);
}


export function compareKbdCommand(c1, c2) {
  return false;
  // return Object.keys(c1).reduce(compareCommands, {})
}
