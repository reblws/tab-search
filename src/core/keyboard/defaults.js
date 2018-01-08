import * as c from './constants';
import { kbdCommand } from './constructor';

export const defaultCommands = {
  [c.TAB_DELETE]: {
    key: c.TAB_DELETE,
    name: 'Delete Tab',
    command: kbdCommand('Ctrl+Backspace'),
    description: 'Deletes the tab currently selected',
  },
  [c.TAB_OPEN]: {
    key: c.TAB_OPEN,
    name: 'Open Tab',
    command: kbdCommand('Enter'),
    description: 'Changes the active tab to the one selected and closes the popup.',
  },
  [c.TAB_NEXT]: {
    key: c.TAB_NEXT,
    name: 'Next Tab',
    command: kbdCommand('ArrowDown'),
    description: 'Moves to the next tab down the list.',
  },
  [c.TAB_PREV]: {
    key: c.TAB_PREV,
    name: 'Previous Tab',
    command: kbdCommand('ArrowUp'),
    description: 'Moves to the previous tab in the list.',
  },
  [c.TAB_REFRESH]: {
    key: c.TAB_REFRESH,
    name: 'Refresh Tab',
    command: kbdCommand('Alt+R'),
    description: 'Refereshes the current tab',
  },
  [c.TAB_PIN]: {
    key: c.TAB_PIN,
    name: 'Pin Tab',
    command: kbdCommand('Alt+P'),
    description: 'Pins the current tab to the the front of the tab list',
  },
  [c.URL_COPY]: {
    key: c.URL_COPY,
    name: 'Copy Tab URL',
    command: kbdCommand('Ctrl+C'),
    description: "Copies the selected tab's URL to your clipboard.",
  },
  [c.TAB_BOOKMARK]: {
    key: c.TAB_BOOKMARK,
    name: 'Bookmark Tab',
    command: kbdCommand('Alt+B'),
    description: 'Bookmakrs the selected tab.',
  },
  [c.DUPLICATE_TAB_DELETE]: {
    key: c.DUPLICATE_TAB_DELETE,
    name: 'Delete Duplicate Tabs',
    command: kbdCommand('Alt+Shift+D'),
    description: 'Deletes all duplicate tabs in the current window',
  },
  [c.MUTE_TOGGLE]: {
    key: c.MUTE_TOGGLE,
    name: 'Toggle Mute',
    command: kbdCommand('Alt+M'),
    description: 'Mutes the selected tab',
  },
  // [c.TAB_MOVE]: kbdCommand('')
};
