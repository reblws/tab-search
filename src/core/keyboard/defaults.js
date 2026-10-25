import * as c from './constants';
import { kbdCommand } from './constructor';

export const defaultCommands = {
  [c.TAB_OPEN]: {
    key: c.TAB_OPEN,
    name: 'Open Tab',
    command: kbdCommand('Enter'),
    secondaryCommand: null,
    description: 'Switch to the selected tab and close the popup.',
  },
  [c.TAB_NEXT]: {
    key: c.TAB_NEXT,
    name: 'Next Tab',
    command: kbdCommand('ArrowDown'),
    secondaryCommand: kbdCommand('ArrowRight'),
    description: 'Move the selection down.',
  },
  [c.TAB_PREV]: {
    key: c.TAB_PREV,
    name: 'Previous Tab',
    command: kbdCommand('ArrowUp'),
    secondaryCommand: kbdCommand('ArrowLeft'),
    description: 'Move the selection up.',
  },
  [c.TAB_DELETE]: {
    key: c.TAB_DELETE,
    name: 'Delete Tab',
    command: kbdCommand('Ctrl+Backspace'),
    secondaryCommand: null,
    description: 'Close the selected tab.',
  },
  [c.TAB_REFRESH]: {
    key: c.TAB_REFRESH,
    name: 'Refresh Tab',
    command: kbdCommand('Alt+R'),
    secondaryCommand: null,
    description: 'Reload the selected tab.',
  },
  [c.TAB_PIN]: {
    key: c.TAB_PIN,
    name: 'Pin Tab',
    command: kbdCommand('Alt+P'),
    secondaryCommand: null,
    description: 'Pin or unpin the selected tab.',
  },
  [c.URL_COPY]: {
    key: c.URL_COPY,
    name: 'Copy Tab URL',
    command: kbdCommand('Ctrl+C'),
    secondaryCommand: null,
    description: "Copy the selected tab's address.",
  },
  [c.DUPLICATE_TAB_DELETE]: {
    key: c.DUPLICATE_TAB_DELETE,
    name: 'Delete Duplicate Tabs',
    command: kbdCommand('Alt+Shift+D'),
    secondaryCommand: null,
    description: 'Close every duplicate tab in this window.',
  },
  [c.MUTE_TOGGLE]: {
    key: c.MUTE_TOGGLE,
    name: 'Toggle Mute',
    command: kbdCommand('Alt+M'),
    secondaryCommand: null,
    description: 'Mute or unmute the selected tab.',
  },
};
