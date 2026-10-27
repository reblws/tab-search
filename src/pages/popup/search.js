import { deletedTabsCache } from 'shell/cache/seen-sets';
import { getCachedFuse } from 'shell/cache/fuse-cache';
import { searchTabs } from 'core/search';
import { gatherExtras } from './gather';

export default function filterResult(query, options, generalSettings, currentWindowId) {
  return function promiseSearchResults(loadedTabs) {
    const deps = {
      currentWindowId,
      // Both passes see the tabs deleted before this search started
      deletedIds: new Set(deletedTabsCache()),
      getIndex: getCachedFuse,
    };
    const search = extras =>
      searchTabs(query, { tabs: loadedTabs, extras }, options, generalSettings, deps);
    // Extra sources (recently closed tabs / history / bookmarks) hit browser
    // IPCs that can stall indefinitely on FF 157+ (Nova), see
    // reblws/tab-search#117 — never block the tab list on them. The caller
    // renders the open tabs right away and merges these in once they settle.
    const extrasP = gatherExtras(query, generalSettings);
    // initial: results from the open tabs alone, ready immediately;
    // extras: same search re-run with the extra sources merged in
    return {
      initial: Promise.resolve([]).then(search),
      extras: extrasP.then(search),
    };
  };
}
