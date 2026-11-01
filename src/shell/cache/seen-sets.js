const cache = function getCache() {
  const set = new Set();
  return () => set;
};

// Stop loading jank if favicon doesn't exist
export const badFavIconCache = cache();
export const deletedTabsCache = cache();
