import PhotonColors from 'static/lib/photon.css';

const {
  blue60: tabColor,
  yellow50: otherWindowTabColor,
  red60: recentlyClosedTabColor,
  ink70: bookmarkColor,
  purple70: historyColor,
} = PhotonColors[':root'];

export { defaultCommands } from 'core/keyboard';
export const initialFuzzySettings = {
  enableFuzzySearch: true,
  shouldSort: true,
  threshold: 0.5,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['title', 'url'],
};

export const initialGeneralSettings = {
  oneLineTabTitles: true,
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
};

export const initialState = {
  lastQuery: '',
};

export const initialColorSettings = {
  tabColor,
  otherWindowTabColor,
  recentlyClosedTabColor,
  bookmarkColor,
  historyColor,
};
