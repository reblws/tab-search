import Fuse from 'fuse.js';
import { deletedTabsCache } from './caches';
import {
  TAB_TYPE,
  OTHER_WINDOW_TAB_TYPE,
  SESSION_TYPE,
} from './constants';
import {
  identity,
  isOfWindow,
  isOfType,
  annotateTypeConditionally,
  annotateType,
  doubleFilterAndMerge,
} from './utils/array';

export default function filterResult(
  query,
  options,
  {
    showRecentlyClosed,
    recentlyClosedLimit,
    alwaysShowRecentlyClosedAtTheBottom: recentAtBottom,
  },
  currentWindowId,
) {
  return function promiseSearchResults(loadedTabs) {
    const isQueryEmpty = query.length === 0;
    const isTabType = isOfType(TAB_TYPE);
    const tabFilter = ({ id }) => !deletedTabsCache().includes(id);
    // First filter any unwanted results
    const annotatedTabs = loadedTabs.filter(tabFilter).map(
      annotateTypeConditionally(
        isOfWindow(currentWindowId),
        TAB_TYPE,
        OTHER_WINDOW_TAB_TYPE,
      ),
    );

    // If we want to move the closed tabs to the botttom filter it
    const shouldMoveClosedToBottom = showRecentlyClosed && recentAtBottom;
    const arrayToSearch = showRecentlyClosed
      ? Promise.all([
        annotatedTabs,
        getRecentlyClosed(recentlyClosedLimit),
      ]).then(([tabs, sessions]) => [...tabs, ...sessions])
      : Promise.resolve(annotatedTabs);
    const doFinalOperation = shouldMoveClosedToBottom
      ? doubleFilterAndMerge(isTabType)
      : identity;
    const search = isQueryEmpty
      ? identity
      : arr => new Fuse(arr, options).search(query);
    return arrayToSearch
      .then(search)
      .then(doFinalOperation);
  };
}

function getRecentlyClosed(maxResults) {
  const tab = ({ tab: _tab }) => _tab;
  const getTabsAndAnnotate = objects =>
    objects.filter(tab).map(tab).map(annotateType(SESSION_TYPE));
  return browser.sessions.getRecentlyClosed({ maxResults })
    .then(getTabsAndAnnotate);
}
