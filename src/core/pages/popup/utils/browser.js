import { deletedTabsCache } from '../caches';
import { SESSION_TYPE } from '../constants';
import {
  removeElementFromTabList,
  repaintElementWithType,
} from './dom';

export function addTabsToPromiseChain(store) {
  const { getState } = store;
  const { searchAllWindows } = getState().general;
  const tabQueryOptions = {};
  if (!searchAllWindows) {
    tabQueryOptions.currentWindow = true;
  }
  return browser.tabs.query(tabQueryOptions)
    .then(tabs => Object.assign({}, store, { loadedTabs: tabs }));
}

export function addCurrentWindowIdToPromiseChain(store) {
  return browser.windows.getCurrent()
    .then(({ id: currentWindowId }) => Object.assign({}, store, { currentWindowId }));
}

export function restoreClosedTab(id) {
  browser.sessions.restore(id);
  window.close();
}

export function deleteTab(
  elementToRemove,
  showRecentlyClosed,
  wasClicked = false,
) {
  const { id } = elementToRemove.dataset;
  // Cache the deleted tabId since the current store passed into configureSearch
  // isn't updated with the latest tabs after tab deletion`
  const tabId = parseInt(id, 10);
  if (!showRecentlyClosed) {
    removeElementFromTabList(elementToRemove, wasClicked);
  } else {
    // Paint it with our indicator instead of removing it from the dom
    // if we want to show recently closed tabs
    repaintElementWithType(elementToRemove, SESSION_TYPE);
  }
  deletedTabsCache().push(tabId);
  browser.tabs.remove(tabId);
}
