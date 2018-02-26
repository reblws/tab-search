import { deletedTabsCache } from '../caches';
import {
  SESSION_TYPE,
  OTHER_WINDOW_TAB_TYPE,
  tabList,
} from '../constants';
import {
  removeElementFromTabList,
  repaintElementWithType,
  findLastElType,
} from './dom';
import { decodeUrl } from './url';

export function addTabsToPromiseChain(store) {
  const { getState } = store;
  const { searchAllWindows } = getState().general;
  const tabQueryOptions = {};
  if (!searchAllWindows) {
    tabQueryOptions.currentWindow = true;
  }
  const tabQueryPromise = () => queryTabs(tabQueryOptions);
  return Object.assign({}, store, { tabQueryPromise });
}

export function addCurrentWindowIdToPromiseChain(store) {
  return browser.windows.getCurrent()
    .then(({ id: currentWindowId }) => Object.assign({}, store, { currentWindowId }));
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
      const lastRecentlyClosedNode = findLastElType(SESSION_TYPE, tabList.children);
      elementToRemove.parentElement.insertBefore(
        elementToRemove,
        // Need to pass null explicitly for append
        lastRecentlyClosedNode || null,
      );
    }
  }
  deletedTabsCache().add(tabId);
  browser.tabs.remove(tabId)
    .then(() => getRecentlyClosed(1))
    .then(sessions => sessions[0].tab.sessionId)
    .then((sessionId) => {
      elementToRemove.dataset.id = sessionId;
    });
}

function getUserOs() {
  return browser.runtime.getPlatformInfo().then(({ os }) => os);
}

function getManifest() {
  return browser.runtime.getManifest();
}

// Returns the user's shortcut for the extension
// () -> Promise< shortcut: String >
export function getOsShortcut() {
  const isMac = os => os === 'mac';
  const replaceCtrlWithCmd = shortcut => shortcut.replace(/ctrl/i, 'Cmd');
  const getManifestSuggestedKey = manifest =>
  // eslint-disable-next-line no-underscore-dangle
    manifest.commands._execute_browser_action.suggested_key;
  const getShortcut = ([os, suggestedKey]) => (
    isMac(os)
      ? replaceCtrlWithCmd(suggestedKey[os])
      : suggestedKey.default
  );
  // ---> [ os, manifest ]
  return Promise.all([
    getUserOs(),
    getManifestSuggestedKey(getManifest()),
  ])
    .then(getShortcut);
}

export function switchActiveTab(tabDataset) {
  const {
    window: windowId,
    id,
    type,
  } = tabDataset;
  const numId = parseInt(id, 10);
  apiP(browser.tabs, 'update', numId, { active: true });
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
  browser.sessions.restore(id);
  if (type === OTHER_WINDOW_TAB_TYPE) {
    focusWindow(windowId);
  }
  window.close();
}

function focusWindow(windowId) {
  return browser.windows.update(
    parseInt(windowId, 10),
    {
      drawAttention: true,
      focused: true,
    },
  );
}

export function queryTab(id) {
  return apiP(browser.tabs, 'get', parseInt(id, 10));
}

export function reloadTab(id) {
  return apiP(browser.tabs, 'reload', parseInt(id, 10));
}

export function pinTab(id, pinned) {
  return apiP(browser.tabs, 'update', parseInt(id, 10), { pinned });
}

export function muteTab(id, muted) {
  return apiP(browser.tabs, 'update', parseInt(id, 10), { muted });
}

function queryTabs(queryOptions) {
  return apiP(browser.tabs, 'query', queryOptions);
}

export function createTab(createOptions) {
  return apiP(browser.tabs, 'create', createOptions);
}

export function searchBookmarks(query) {
  return apiP(browser.bookmarks, 'search', query);
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

// recentlyclosed func
export function getRecentlyClosed(maxResults) {
  return apiP(browser.sessions, 'getRecentlyClosed', { maxResults });
}

// TODO: HISTORY_LIMIT should be a pref
const HISTORY_LIMIT = 25;
export function searchHistory(query) {
  return apiP(browser.history, 'search', {
    text: query,
    maxResults: HISTORY_LIMIT,
  });
}

// Promise that sends a rejection error if an API is undefined
function apiP(api, method, ...args) {
  return new Promise((resolve, reject) => {
    if (api) {
      resolve(api[method](...args));
    } else if (!api[method]) {
      reject(new Error(`Method ${method} doesn't exist on ${api}!`));
    } else {
      reject(new Error(`${api} API not available!`));
    }
  });
}

