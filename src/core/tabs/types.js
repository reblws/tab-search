// Object types, these correspond with css classnames as well
export const TAB_TYPE = 'tab';
export const SESSION_TYPE = 'session';
export const OTHER_WINDOW_TAB_TYPE = 'other-window-tab';
export const BOOKMARK_TYPE = 'bookmark';
export const HISTORY_TYPE = 'history';

export const TYPE_COLOR_PROPERTY_MAP = {
  [TAB_TYPE]: 'tabColor',
  [OTHER_WINDOW_TAB_TYPE]: 'otherWindowTabColor',
  [SESSION_TYPE]: 'recentlyClosedTabColor',
  [BOOKMARK_TYPE]: 'bookmarkColor',
  [HISTORY_TYPE]: 'historyColor',
};

export const COLOR_PROPERTY_TYPE_MAP = {
  tabColor: TAB_TYPE,
  otherWindowTabColor: OTHER_WINDOW_TAB_TYPE,
  recentlyClosedTabColor: SESSION_TYPE,
  bookmarkColor: BOOKMARK_TYPE,
  historyColor: HISTORY_TYPE,
};
