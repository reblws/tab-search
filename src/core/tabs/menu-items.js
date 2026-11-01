import {
  TAB_REFRESH,
  TAB_PIN,
  MUTE_TOGGLE,
  TAB_DELETE,
} from '../keyboard/constants';
import { TAB_TYPE, OTHER_WINDOW_TAB_TYPE, BOOKMARK_TYPE } from './types';

// TabSearch's own items in the tab menu that a result opens (Firefox only).
// Each one runs the popup keyboard command of the same name
export const TAB_MENU_ITEMS = [
  { id: 'tab-reload', title: 'Reload Tab', command: TAB_REFRESH },
  { id: 'tab-pin', title: 'Pin Tab', command: TAB_PIN },
  { id: 'tab-mute', title: 'Mute Tab', command: MUTE_TOGGLE },
  { id: 'tab-close', title: 'Close Tab', command: TAB_DELETE },
];

// The context a result row's menu opens with (Firefox's
// menus.overrideContext), or null for rows without one
export function menuContext({ id, type }) {
  switch (type) {
    case TAB_TYPE:
    case OTHER_WINDOW_TAB_TYPE:
      return { context: 'tab', tabId: parseInt(id, 10) };
    case BOOKMARK_TYPE:
      return { context: 'bookmark', bookmarkId: id };
    default:
      return null;
  }
}

// Pin and Mute say what a click will do, like the browser's own tab menu
export function menuTitles({ pinned, mutedInfo }) {
  return {
    'tab-pin': pinned ? 'Unpin Tab' : 'Pin Tab',
    'tab-mute': mutedInfo.muted ? 'Unmute Tab' : 'Mute Tab',
  };
}
