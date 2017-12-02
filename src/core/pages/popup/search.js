import Fuse from 'fuse.js';
import { deletedTabsCache } from './caches';
import {
  TAB_TYPE,
  OTHER_WINDOW_TAB_TYPE,
  SESSION_TYPE,
} from './constants';
import {
  isActive,
  identity,
  isOfWindow,
  isOfType,
  annotateTypeConditionally,
  annotateType,
  partition,
  concat,
} from './utils/array';

export default function filterResult(
  query,
  options,
  {
    showRecentlyClosed,
    recentlyClosedLimit,
    alwaysShowRecentlyClosedAtTheBottom: recentAtBottom,
    shouldSortByMostRecentlyUsedAll: sortMruAll,
    shouldSortByMostRecentlyUsedOnPopup: sortMruPopup,
  },
  currentWindowId,
) {
  const { enableFuzzySearch, keys: searchKeys } = options;
  return function promiseSearchResults(loadedTabs) {
    const isQueryEmpty = query.length === 0;
    // const isTabType = isOfType(TAB_TYPE);
    const isSessionType = isOfType(SESSION_TYPE);
    const tabFilter = ({ id }) => !deletedTabsCache().includes(id);
    // First filter any unwanted results
    const annotatedTabs = loadedTabs.filter(tabFilter).map(
      annotateTypeConditionally(
        isOfWindow(currentWindowId),
        TAB_TYPE,
        OTHER_WINDOW_TAB_TYPE,
      ),
    );

    // Determine array to search over
    const arrayToSearch = showRecentlyClosed
      ? Promise.all([
        annotatedTabs,
        getRecentlyClosed(recentlyClosedLimit),
      ]).then(([tabs, sessions]) => [...tabs, ...sessions])
      : Promise.resolve(annotatedTabs);

    // Determine search function
    let search;
    if (isQueryEmpty) {
      search = identity;
    } else if (enableFuzzySearch) {
      let fuseOptions = options;
      // Don't bother fuse sorting if we want to sort by most recently used
      if (sortMruAll) {
        fuseOptions = Object.assign({}, options, { shouldSort: false });
      }
      search = arr => new Fuse(arr, fuseOptions).search(query);
    } else {
      // If enableFuzzySearch is off
      const matchedTabs = tab => searchKeys.some(
        key => tab[key].toLowerCase().includes(query.toLowerCase()),
      );
      search = arr => arr.filter(matchedTabs);
    }

    // Apply any extra transformations to results
    const shouldMoveClosedToBottom = showRecentlyClosed && recentAtBottom;
    const shouldMruSort = (sortMruAll && sortMruPopup)
      ? sortMruAll
      : isQueryEmpty && sortMruPopup;
    return arrayToSearch
      .then(search)
      .then((searchResults) => {
        // Sort it by how closely
        // Array is partitioned right-to-left
        const predicates = [];
        if (shouldMoveClosedToBottom) {
          predicates.push(isSessionType);
        }
        if (shouldMruSort) {
          // Whatever the active tabs are will always be the most recently used.
          // Push them to the bottom if need to sort by most recently used
          predicates.push(isActive);
        }
        if (predicates.length === 0) {
          return searchResults;
        }
        const partitionResults = partition(...predicates);
        let results = partitionResults(searchResults);
        if (shouldMruSort) {
          results = results.map(p => p.sort(mostRecentlyUsed));
        }
        return results.reduceRight(concat);
      });
  };
}

function mostRecentlyUsed(a, b) {
  return -(a.lastAccessed - b.lastAccessed);
}

function getRecentlyClosed(maxResults) {
  const tab = ({ tab: _tab }) => _tab;
  // No incognito please
  const filterIncognito = ({ incognito }) => !incognito;
  // Don't want to show new tab pages
  const isNewTabPage = ({ url }) => url !== 'about:newtab';
  const getTabsAndAnnotate = objects => objects
    .filter(tab)
    .map(tab)
    .filter(isNewTabPage).filter(filterIncognito)
    .map(annotateType(SESSION_TYPE));
  return browser.sessions.getRecentlyClosed({ maxResults })
    .then(getTabsAndAnnotate);
}
