export default {
  showTabCountBadgeText: false,
  showBookmarks: false,
  showRecentlyClosed: false,
  searchAllWindows: false,
  enableOverlay: false,
  fuzzySearch: {
    enableFuzzySearch: true,
    options: {
      shouldSort: true,
      threshold: 0.5,
      maxPattenLength: 32,
      minMatchCharLength: 1,
      keys: ['title', 'url'],
    },
  },
};
