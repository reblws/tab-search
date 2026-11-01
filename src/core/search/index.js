import { TAB_TYPE, OTHER_WINDOW_TAB_TYPE } from 'core/tabs/types';
import { isOfWindow } from 'core/tabs/predicates';
import { annotateTypeConditionally } from 'core/lib/fp';
import { createMatcher } from './match';
import { createOrder } from './order';

// Searches the open tabs, plus any already normalized extra sources
// (recently closed tabs / history / bookmarks), and returns the results in
// display order. Deleted tabs are dropped from the open tabs only.
export function searchTabs(
  query,
  { tabs, extras = [] },
  fuzzyOptions,
  {
    showRecentlyClosed,
    alwaysShowRecentlyClosedAtTheBottom: recentAtBottom,
    shouldSortByMostRecentlyUsedAll: sortMruAll,
    shouldSortByMostRecentlyUsedOnPopup: sortMruPopup,
  },
  { currentWindowId, deletedIds = new Set(), getIndex },
) {
  const isQueryEmpty = query.length === 0;
  const annotatedTabs = tabs.filter(({ id }) => !deletedIds.has(id)).map(
    annotateTypeConditionally(
      isOfWindow(currentWindowId),
      TAB_TYPE,
      OTHER_WINDOW_TAB_TYPE,
    ),
  );
  const match = createMatcher(query, fuzzyOptions, { sortMruAll, getIndex });
  const order = createOrder({
    isQueryEmpty,
    shouldMruSort: (sortMruAll && sortMruPopup) || (isQueryEmpty && sortMruPopup),
    // If we want to move the closed tabs to the bottom filter it
    shouldMoveClosedToBottom: showRecentlyClosed && recentAtBottom,
    currentWindowId,
  });
  return order(match([...annotatedTabs, ...extras]));
}
