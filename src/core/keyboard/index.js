import { defaultCommands } from './defaults';
import { compareKbdCommand } from './compare';
import { isValidKbdCommand, kbdCommand } from './constructor';
import { kbdCommandToString } from './to-string';

export * from './constants';

export default {
  isEqual: compareKbdCommand,
  isValid: isValidKbdCommand,
  toString: kbdCommandToString,
  defaultCommands,
  command: kbdCommand,
};
