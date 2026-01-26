export const favIconFallback = '/assets/file.svg';
export const alertCircle = '/assets/alert-circle.svg';
export const BOOKMARKS_SVG_PATH = '/assets/bookmark.svg';
export const HISTORY_SVG_PATH = '/assets/book.svg';
export const RELOAD_SVG_PATH = '/assets/reload.svg';
export const DEL_CIRCLE_SVG_PATH = '/assets/x-circle.svg';
export const deleteButton = document.querySelector('.delete-circle');
export const searchInput = document.querySelector('.search');
export const tabList = document.querySelector('.tab-list');
export const prefsBtn = document.getElementById('pref-btn');

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

// css classnames
export const AUDIBLE_CLASSNAME = 'audible';
export const LOADER_CLASSNAME = 'loader';
export const WORDBREAK_ALL_CLASSNAME = 'wordbreak-all';
export const SELECTED_TAB_CLASSNAME = 'tab-object--selected';
export const NO_RESULT_CLASSNAME = 'no-result';
export const TAB_URL_CLASSNAME = 'tab-url';
export const TAB_PIN_CLASSNAME = 'pin';
export const TAB_MUTED_CLASSNAME = 'mute';
export const TAB_DELETE_BTN_CLASSNAME = 'tab-object__delete-button';
export const d = document;

// css ids
export const TAB_ACTIVE_ID = 'activeTab';

// Popup size presets
export const POPUP_SIZE_PRESETS = {
  small: {
    bodyWidth: '300px',
    tabListHeight: '380px',
    searchWidth: '250px',
    headerHeight: '40px',
  },
  medium: {
    bodyWidth: '355px',
    tabListHeight: '450px',
    searchWidth: '300px',
    headerHeight: '48px',
  },
  large: {
    bodyWidth: '420px',
    tabListHeight: '520px',
    searchWidth: '355px',
    headerHeight: '56px',
  },
  xlarge: {
    bodyWidth: '500px',
    tabListHeight: '530px',
    searchWidth: '430px',
    headerHeight: '64px',
  },
};
