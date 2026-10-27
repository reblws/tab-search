import { SESSION_TYPE, OTHER_WINDOW_TAB_TYPE } from 'core/tabs/types';
import { isActive, isOfWindow, isOfType } from 'core/tabs/predicates';
import { partition, concat, composeFilterAnd } from 'core/lib/fp';

export function mostRecentlyUsed(a, b) {
  return -(a.lastAccessed - b.lastAccessed);
}

// Returns results => results in display order
export function createOrder({
  isQueryEmpty,
  shouldMruSort,
  shouldMoveClosedToBottom,
  currentWindowId,
}) {
  const isSessionType = isOfType(SESSION_TYPE);
  const isOtherWindowTabType = isOfType(OTHER_WINDOW_TAB_TYPE);
  return function postProcess(searchResults) {
    // If query is empty then we just need to show them in order of tab
    // posn, partitioned by tab type
    if (isQueryEmpty && !shouldMruSort) {
      return partition(isSessionType, isOtherWindowTabType)(searchResults)
        .reduceRight(concat);
    }
    // Array is ordered by predicates from right-to-left
    const predicates = [];
    if (shouldMoveClosedToBottom) {
      predicates.push(isSessionType);
    }
    if (shouldMruSort) {
      // The current tab is always the most recently used, so push it to
      // the bottom. Active tabs of other windows sort by time like the rest
      predicates.push(composeFilterAnd(isActive, isOfWindow(currentWindowId)));
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
  };
}
