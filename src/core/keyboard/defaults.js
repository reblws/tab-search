import * as c from './constants';
import { kbdCommand } from './constructor';

export default {
  [c.TAB_DELETE]: kbdCommand('Ctrl+Backspace'),
  [c.TAB_OPEN]: kbdCommand('Enter'),
  [c.TAB_NEXT]: kbdCommand('ArrowDown'),
  [c.TAB_PREV]: kbdCommand('ArrowUp'),
  // [c.TAB_MOVE]: kbdCommand('')
  [c.TAB_REFRESH]: kbdCommand('Alt+R'),
  [c.TAB_PIN]: kbdCommand('Alt+P'),
  [c.URL_COPY]: kbdCommand('Alt+C'),
  [c.TAB_BOOKMARK]: kbdCommand('Alt+B'),
  [c.DUPLICATE_TAB_DELETE]: kbdCommand('Alt+Shift+D'),
  [c.MUTE_TOGGLE]: kbdCommand('Alt+M'),
};
