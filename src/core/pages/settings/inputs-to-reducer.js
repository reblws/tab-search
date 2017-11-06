/*
Key mappings from input id names to corresponding reducer state
*/
// TODO: there's probably a way to do this programmatically instead of relying
//       on literals. Need to import '/reducers/defaults'
export default {
  showTabCountBadgeText: 'general.showTabCountBadgeText',
  showRecentlyClosed: 'general.showRecentlyClosed',
  searchAllWindows: 'general.searchAllWindows',
  alwaysShowRecentlyClosedAtTheBottom: 'general.alwaysShowRecentlyClosedAtTheBottom',
  recentlyClosedLimit: 'general.recentlyClosedLimit',
  enableOverlay: 'general.enableOverlay',
  useFallbackFont: 'general.useFallbackFont',
  enableFuzzySearch: 'fuzzy.enableFuzzySearch',
  shouldSort: 'fuzzy.shouldSort',
  threshold: 'fuzzy.threshold',
  showUrls: 'fuzzy.keys', // Modifies 'keys'
};

