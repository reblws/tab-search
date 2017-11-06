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
