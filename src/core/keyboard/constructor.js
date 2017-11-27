// This function creates a KeyboardCommand object from an event
// Trims down the event object so it only contains the info we need
// to construct a key

// On macs the metaKey is triggered. We want them to be treated equivalently?
// So the value of the ctrlKey property should be (ctrlKey || metaKey)
const kbdCommandProps = [
  'shiftKey', // bool
  'altKey', // bool
  'ctrlKey', // bool
  'key', // string
];

// Accepts a valid command string or
export function kbdCommand(input) {
  if (typeof input === 'string') {
    return kbdCommandString(input);
  } else if (typeof input === 'object') {
    return kbdCommandEvent(input);
  }
  throw new Error(
    "Command input isn't the right type! KbdCommand requires a valid command\
    string or object",
  );
}

function kbdCommandEvent(event){
  if (!kbdCommandProps.all(k => !!event[k])) {
    throw new Error('Command input does not contain the required props!');
  }
  return kbdCommandProps.reduce((acc, k) =>
    Object.assign({ [k]: event[k] }, acc), {});
}


export function compareKbdCommand(c1, c2) {
  return Object.keys(c1).reduce(compareCommands, {})
}
