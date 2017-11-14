const cache = function getCache() {
  const ary = [];
  return () => ary;
};

// If a website doesn't have a favicon save that favicon's url here so a place
export const badFavIconCache = cache();

export const deletedTabsCache = cache();
