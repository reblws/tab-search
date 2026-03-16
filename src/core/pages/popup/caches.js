const cache = function getCache() {
  const set = new Set();
  return () => set;
};

// Stop loading jank if favicon doesn't exist
export const badFavIconCache = cache();
export const deletedTabsCache = cache();

// Tab data cache with TTL
let tabDataCache = null;
let tabDataCacheTime = 0;
const TAB_CACHE_TTL = 2000;

export function getCachedTabs() {
  if (tabDataCache && (Date.now() - tabDataCacheTime) < TAB_CACHE_TTL) {
    return Promise.resolve(tabDataCache);
  }
  return null;
}

export function setCachedTabs(tabs) {
  tabDataCache = tabs;
  tabDataCacheTime = Date.now();
}

export function invalidateTabCache() {
  tabDataCache = null;
  tabDataCacheTime = 0;
}

// Tab event listeners to invalidate cache when tabs change
const tabCacheInvalidationListeners = {
  onCreated: () => invalidateTabCache(),
  onRemoved: () => invalidateTabCache(),
  onUpdated: () => invalidateTabCache(),
};

export function addTabCacheListeners() {
  browser.tabs.onCreated.addListener(tabCacheInvalidationListeners.onCreated);
  browser.tabs.onRemoved.addListener(tabCacheInvalidationListeners.onRemoved);
  browser.tabs.onUpdated.addListener(tabCacheInvalidationListeners.onUpdated);
}

export function removeTabCacheListeners() {
  browser.tabs.onCreated.removeListener(tabCacheInvalidationListeners.onCreated);
  browser.tabs.onRemoved.removeListener(tabCacheInvalidationListeners.onRemoved);
  browser.tabs.onUpdated.removeListener(tabCacheInvalidationListeners.onUpdated);
}
