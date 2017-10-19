/* Popup initialization */
import { createUIStore } from 'redux-webext';
import { addEventListeners } from './event-listeners';
import { populateTabList } from './dom-utils';

function addLoadedTabsToStoreObject(store) {
  const { getState, currentWindowId } = store;
  const { searchAllWindows } = getState().settings;
  const { windowTabs } = getState().tabs;
  const loadedTabs = searchAllWindows
    ? Object.values(windowTabs).reduce((acc, arr) => [...acc, ...arr])
    : windowTabs[currentWindowId];
  return Promise.all(loadedTabs.map(({ id }) => browser.tabs.get(id)))
    .then(tabs => Object.assign({}, store, { loadedTabs: tabs }));
}

// Add a key containing adding the current windowId to the popup.
const windowIdPromise = browser.windows.getCurrent()
  .then(({ id }) => ({ currentWindowId: id }));
// Adds a key 'windowId' to the store object.
// Store object is now -> { dispatch, getState, subscribe, currentWindowId, loadedTabs }
const mergeObjects = arr => arr.reduce((acc, obj) => Object.assign({}, acc, obj));

Promise.all([createUIStore(), windowIdPromise]).then(mergeObjects)
  .then(addLoadedTabsToStoreObject)
  .then(populateTabList)
  .then(addEventListeners)
  .catch((e) => {
    console.error(e);
    throw new Error('Ran into a problem initializing popup window.');
  });

