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
import { tabQueryOptions } from 'core/tabs/query';
import { closedRowPlan } from 'core/results/list';
import { tabList } from './nodes';
import {
  removeElementFromTabList,
  repaintElementWithType,
} from './render';

export function addTabsToPromiseChain(store) {
  const options = tabQueryOptions(store.getState().general);
  return Object.assign({}, store, { tabQueryPromise: () => queryTabs(options) });
}

export function addCurrentWindowIdToPromiseChain(store) {
  return getCurrentWindowId()
    .then(currentWindowId => Object.assign({}, store, { currentWindowId }));
}

// Closes the row's tab. The row goes away, or stays as a recently closed
// row when those are shown, as core/results/list.js's closedRowPlan says.
export function deleteTab(elementToRemove, generalSettings, wasClicked = false) {
  const rows = [...tabList().children];
  const index = rows.indexOf(elementToRemove);
  const plan = closedRowPlan(index, rows.map(row => row.dataset.type), generalSettings);
  if (plan.remove) {
    removeElementFromTabList(elementToRemove, wasClicked);
  } else {
    repaintElementWithType(elementToRemove, SESSION_TYPE);
    if (plan.moveBefore !== undefined) {
      // insertBefore(node, null) appends
      tabList().insertBefore(elementToRemove, rows[plan.moveBefore] || null);
    }
  }
  // The store passed into configureSearch doesn't learn about deleted tabs,
  // so searches skip the ids in this cache. It never needs clearing: the
  // only way to restore a tab is to open it, which closes the popup.
  const tabId = parseInt(elementToRemove.dataset.id, 10);
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
