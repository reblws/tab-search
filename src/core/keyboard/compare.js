import dEqual from 'fast-deep-equal';

// Compares two possible objects
export function compareKbdCommand(c1, c2) {
  return dEqual(c1, c2);
}
