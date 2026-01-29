import AcornColors from 'static/lib/acorn-tokens.css';

const {
  colorBlue60: tabColor,
  colorYellow50: otherWindowTabColor,
  colorRed60: recentlyClosedTabColor,
  colorInk70: bookmarkColor,
  colorPurple70: historyColor,
} = AcornColors[':root'];

export { defaultCommands } from 'core/keyboard';
export const initialFuzzySettings = {
  enableFuzzySearch: true,
  shouldSort: true,
  threshold: 0.5,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  ignoreLocation: true,
  keys: ['title', 'url'],
};

export const initialGeneralSettings = {
  ignorePinnedTabs: false,
  oneLineTabTitles: false,
  showVisualDeleteTabButton: true,
  showHistory: false,
  showBookmarks: false,
  showTabCountBadgeText: true,
  searchAllWindows: true,
  enableOverlay: false,
  showRecentlyClosed: true,
  alwaysShowRecentlyClosedAtTheBottom: true,
  recentlyClosedLimit: 5,
  useFallbackFont: false,
  showLastQueryOnPopup: false,
  shouldSortByMostRecentlyUsedOnPopup: false,
  shouldSortByMostRecentlyUsedAll: false,
  tabUrlSize: 11,
  tabTitleSize: 13,
  popupSize: 'medium',
};

export const initialState = {
  lastQuery: '',
};

export const initialColorSettings = {
  popupBadgeColor: '#FF0000',
  tabColor,
  otherWindowTabColor,
  recentlyClosedTabColor,
  bookmarkColor,
  historyColor,
};
