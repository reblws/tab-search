import { deletedTabsCache } from 'shell/cache/seen-sets';
import { getCachedTabs, setCachedTabs } from 'shell/cache/tab-cache';
import {
  queryTabs as queryBrowserTabs,
  activateTab,
  removeTab,
  createTab,
} from 'shell/platform/tabs';
import { getCurrentWindowId, focusWindow } from 'shell/platform/windows';
import { getRecentlyClosed, restoreSession } from 'shell/platform/sessions';
import { fetchFocusTimes } from 'shell/platform/recency';
import { SESSION_TYPE, OTHER_WINDOW_TAB_TYPE } from 'core/tabs/types';
import { decodeUrl } from 'core/lib/url';
import { withFocusTimes } from 'core/tabs/recency';
import { tabList } from './nodes';
import {
  removeElementFromTabList,
  repaintElementWithType,
  findLastElType,
} from './render';

export function addTabsToPromiseChain(store) {
  const { getState } = store;
  const {
    searchAllWindows,
    ignorePinnedTabs,
  } = getState().general;
  const tabQueryOptions = {};
  if (!searchAllWindows) {
    tabQueryOptions.currentWindow = true;
  }
  if (ignorePinnedTabs) {
    tabQueryOptions.pinned = false;
  }
  const tabQueryPromise = () => queryTabs(tabQueryOptions);
  return Object.assign({}, store, { tabQueryPromise });
}

export function addCurrentWindowIdToPromiseChain(store) {
  return getCurrentWindowId()
    .then(currentWindowId => Object.assign({}, store, { currentWindowId }));
}

export function deleteTab(
  elementToRemove,
  {
    showRecentlyClosed,
    alwaysShowRecentlyClosedAtTheBottom,
  },
  wasClicked = false,
) {
  const { id } = elementToRemove.dataset;
  // Cache the deleted tabId since the current store passed into configureSearch
  // isn't updated with the latest tabs after tab deletion`
  // Don't have to worry about removing it since the only way
  // to restore a tab is by entering it -> which closes the
  // popup and flushes the cache
  const tabId = parseInt(id, 10);
  if (!showRecentlyClosed) {
    removeElementFromTabList(elementToRemove, wasClicked);
  } else {
    // Paint it with our indicator instead of removing it from the dom
    // if we want to show recently closed tabs
    repaintElementWithType(elementToRemove, SESSION_TYPE);
    // Get the most recently closed tab (should be the one we're deleting rn)
    if (alwaysShowRecentlyClosedAtTheBottom) {
      // Undefined if not found
      const lastRecentlyClosedNode = findLastElType(SESSION_TYPE, tabList().children);
      elementToRemove.parentElement.insertBefore(
        elementToRemove,
        // Need to pass null explicitly for append
        lastRecentlyClosedNode || null,
      );
    }
  }
  deletedTabsCache().add(tabId);
  removeTab(tabId)
    .then(() => getRecentlyClosed(1))
    .then(sessions => sessions[0].tab.sessionId)
    .then((sessionId) => {
      elementToRemove.dataset.id = sessionId;
    });
}

export function switchActiveTab(tabDataset) {
  const {
    window: windowId,
    id,
    type,
  } = tabDataset;
  activateTab(id);
  if (type === OTHER_WINDOW_TAB_TYPE) {
    focusWindow(windowId);
  }
  window.close();
}

export function restoreClosedTab(tabDataset) {
  const {
    window: windowId,
    id,
    type,
  } = tabDataset;
  restoreSession(id);
  if (type === OTHER_WINDOW_TAB_TYPE) {
    focusWindow(windowId);
  }
  window.close();
}

function queryTabs(queryOptions) {
  const cached = getCachedTabs();
  if (cached) {
    return cached;
  }
  return Promise.all([
    queryBrowserTabs(queryOptions),
    fetchFocusTimes(),
  ]).then(([queriedTabs, recency]) => {
    const tabs = withFocusTimes(queriedTabs, recency);
    setCachedTabs(tabs);
    return tabs;
  });
}

export function openBookmark(dataset) {
  const { id } = dataset;
  return createTab({
    active: true,
    url: decodeUrl(id),
  })
    .then(() => {
      window.close();
    });
}

export function openHistoryItem(dataset) {
  const { url } = dataset;
  return createTab({ active: true, url: decodeUrl(url) })
    .then(() => window.close());
}
