import Fuse from 'fuse.js';
import { deletedTabsCache } from './caches';
import {
  TAB_TYPE,
  OTHER_WINDOW_TAB_TYPE,
  SESSION_TYPE,
  BOOKMARK_TYPE,
  HISTORY_TYPE,
} from './constants';
import {
  encodeUrl,
  parseUrl,
  hasValidHostname,
} from './utils/url';
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
  searchHistory,
} from './utils/browser';

// Minimum query length required to search extra browser apis (history and bookmarks)
const MIN_QUERY_LENGTH = 3;

export default function filterResult(
  query,
  options,
  {
    showHistory,
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
    const hasMinQueryLen = query.length > MIN_QUERY_LENGTH;
    // Initialize the search array
    // If we want to move the closed tabs to the botttom filter it
    const shouldMoveClosedToBottom = showRecentlyClosed && recentAtBottom;
    const arrayToSearchP = [annotatedTabs];
    if (showHistory && hasMinQueryLen) {
      arrayToSearchP.push(searchHistory(query).then(normalizeHistory));
    }
    if (showRecentlyClosed) {
      arrayToSearchP.push(normalizeRecentlyClosedTabs(recentlyClosedLimit));
    }
    if (showBookmarks && hasMinQueryLen) {
      arrayToSearchP.push(searchBookmarks(query).then(normalizeBookmarks));
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
// Dom specific aspects of the object like favicon url should be handled
// by dom.tabToTag

// At minimum, each normalized object should have the following fields:
//        type: the typestring specified in constants
//        id: retrieving this specific object should depend on this value

// Should normalize results to match a tabs.Tab object as closely as possible
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/Tab

function normalizeRecentlyClosedTabs(maxResults) {
  const tab = ({ tab: _tab }) => _tab;
  // No incognito please
  const filterIncognito = ({ incognito }) => !incognito;
  // Don't want to show new tab pages
  const filterNewTab = x => !isOfUrl('about:newtab')(x);
  const filters = composeFilterOr(
    tab,
    filterNewTab,
    filterIncognito,
  );
  const normalize = sessionTabs => sessionTabs
    .map(tab)
    .filter(filters)
    .map(annotateType(SESSION_TYPE));
  return getRecentlyClosed(maxResults).then(normalize);
}

function normalizeBookmarks(bookmarks) {
  // TODO: should we dedup the bookmarks? if they're already in the search list
  //                This would require appending the bookmarks after the initial
  //                search

  // Bookmarks API throws an error if the query is falsey
  // Return an empty array if the query is empty
  // Since single character matches will probably overload the result list,
  // for now lets just set a minimum at least 2 chars in a trimmed query
  if (!bookmarks) {
    return Promise.resolve([]);
  }

  // If a url is undefined or contains no valid hostname, that means
  // its probably a folder or bookmark we don't care about.
  const filterFolders = ({ url }) => hasValidHostname(parseUrl(url));

  // We can't open bookmarks by ID, instead we need to pass the url to
  // browser.tabs.create . Override the id property with the value of the url
  const urlAsId = tab => Object.assign({}, tab, { id: encodeUrl(tab.url) });

  // Type property is only available from bookmarks from FF57+, annotate the
  // bookmarks type for backward compatbility
  const normalize = bs =>
    bs.filter(filterFolders)
      .map(annotateType(BOOKMARK_TYPE))
      .map(urlAsId);
  return normalize(bookmarks);
}

function normalizeHistory(historicalRecords) {
  if (!historicalRecords) {
    return [];
  }
  return historicalRecords.map(annotateType(HISTORY_TYPE));
}
