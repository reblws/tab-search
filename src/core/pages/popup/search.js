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
      arrayToSearchP.push(getRecentlyClosed(recentlyClosedLimit));
    }
    if (showBookmarks) {
      arrayToSearchP.push(queryBookmarks(query));
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

// Should normalize results to match a tabs.Tab object as closely as possible
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/Tab

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

function queryBookmarks(query) {
  // Use `browser.bookmarks.search` to query the bookmarks api, note:
  // "This function throws an exception if any of the input parameters are
  // invalid or are not of an appropriate type; look in the console for the
  // error message. The exceptions don't have error IDs, and the messages
  // themselves may change, so don't write code that tries to interpret them."

  // We'll use the query input as a string to search against.

  // "If query is a string, it consists of zero or more search terms. Search
  // terms are space-delimited and may be enclosed in quotes to allow
  // multiple-word phrases to be searched against. Each search term matches if
  // it matches any substring in the bookmark's URL or title. Matching is
  // case-insensitive. For a bookmark to match the query, all the query's search
  //  terms must match."

  // bookmarks.search returns a bookmarkTreeNode with no children property
  //

  // Since we don't have access to the favicons immediately, we should
  // just insert the bookmark svg
  return;
}
