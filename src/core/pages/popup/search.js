import Fuse from 'fuse.js';
import { deletedTabsCache } from './caches';
import {
  TAB_TYPE,
  OTHER_WINDOW_TAB_TYPE,
  SESSION_TYPE,
  BOOKMARK_TYPE,
} from './constants';
import {
  isActive,
  identity,
  isOfUrl,
  isOfWindow,
  isOfType,
  annotateTypeConditionally,
  annotateType,
  partition,
  concat,
  composeFilterOr,
} from './utils/array';
import {
  getRecentlyClosed,
  searchBookmarks,
} from './utils/browser';

export default function filterResult(
  query,
  options,
  {
    showBookmarks,
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

    // Initialize the search array
    // If we want to move the closed tabs to the botttom filter it
    const shouldMoveClosedToBottom = showRecentlyClosed && recentAtBottom;
    // Here ask for showBookmarks
    const arrayToSearchP = [annotatedTabs];
    if (showRecentlyClosed) {
      arrayToSearchP.push(normalizeRecentlyClosedTabs(recentlyClosedLimit));
    }
    if (showBookmarks) {
      arrayToSearchP.push(normalizeBookmarks(query));
    }
    const arrayToSearch = Promise.all(arrayToSearchP).then(xs => xs.reduce(concat));
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

// Each of these browser API getters should handle annotating the tabs with
// their proper types
// Dom specific aspects of the object like faviconurl should be handled
// by dom.tabToTag

// Should normalize results to match a tabs.Tab object as closely as possible
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/Tab

function normalizeRecentlyClosedTabs(maxResults) {
  const tab = ({ tab: _tab }) => _tab;
  // No incognito please
  const filterIncognito = ({ incognito }) => !incognito;
  // Don't want to show new tab pages
  const filterNewTab = !isOfUrl('about:newtab');
  const filters = composeFilterOr(
    tab,
    filterNewTab,
    filterIncognito,
  );
  const getTabsAndAnnotate = sessionTabs =>
    sessionTabs
      .map(tab)
      .filter(filters)
      .map(annotateType(SESSION_TYPE));
  return getRecentlyClosed(maxResults).then(getTabsAndAnnotate);
}

function normalizeBookmarks(query) {
  const MIN_QUERY_LENGTH = 3;
  // Bookmarks API throws an error if the query is falsey
  // Return an empty array if the query is empty

  // Since single character matches will probably overload the result list,
  // for now lets just set a minimum at least 2 chars in a trimmed query
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return Promise.resolve([]);
  }

  // Type property is only available from bookmarks from FF57+, annotate the
  // bookmarks type for backward compatbility
  const annotateBookmarks = bookmarks =>
    bookmarks.map(annotateType(BOOKMARK_TYPE));
  return searchBookmarks(query).then(annotateBookmarks);
}
