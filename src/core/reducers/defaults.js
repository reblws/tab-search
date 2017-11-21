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
};

export const initialState = {
  lastQuery: '',
};
