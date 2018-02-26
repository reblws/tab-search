import dEqual from 'fast-deep-equal';

// Compares two possible objects
export function compareKbdCommand(c1, c2) {
  if (Array.isArray(c1)) {
    return dEqual(c1[0], c1[1]);
  }
  return dEqual(c1, c2);
}
