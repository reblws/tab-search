import Fuse from 'fuse.js';
import fastDeepEqual from 'fast-deep-equal';

let cachedFuse = null;
let cachedTabsHash = null;
let cachedOptions = null;

function generateTabsHash(tabs) {
  return tabs.map(t => `${t.id}:${t.lastAccessed}`).join(',');
}

export function getCachedFuse(tabs, options) {
  const tabsHash = generateTabsHash(tabs);
  if (!cachedFuse || tabsHash !== cachedTabsHash || !fastDeepEqual(cachedOptions, options)) {
    cachedFuse = new Fuse(tabs, options);
    cachedTabsHash = tabsHash;
    cachedOptions = options;
  }
  return cachedFuse;
}
