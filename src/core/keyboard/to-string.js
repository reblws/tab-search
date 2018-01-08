// Returns a string representation of a kbdCommand
// TODO: Need to get user's OS. If they are on a mac, replace instances of
//       ctrlKey with 'Cmd'.
export function kbdCommandToString({ key, ctrlKey, altKey, shiftKey }) {
  const stringParts = [];
  if (ctrlKey) {
    // TODO: If user is on mac, change this to Cmd.
    stringParts.push('Ctrl');
  }
  if (shiftKey) {
    stringParts.push('Shift');
  }
  if (altKey) {
    stringParts.push('Alt');
  }
  stringParts.push(key.length === 1 ? key.toUpperCase() : key);
  return stringParts.join('+');
}
