import { compareKbdCommand } from './compare';
import { isValidKbdCommand, kbdCommand } from './constructor';
import { kbdCommandToString } from './to-string';

export { defaultCommands } from './defaults';
export * from './constants';

export default {
  isEqual: compareKbdCommand,
  isValid: isValidKbdCommand,
  toString: kbdCommandToString,
  command: kbdCommand,
};
