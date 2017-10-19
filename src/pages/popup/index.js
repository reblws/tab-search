/* Popup initialization */
import { createUIStore } from 'redux-webext';
import { addEventListeners } from './event-listeners';
import { populateTabList } from './dom-utils';

function addTabsToPromiseChain(store) {
  const { getState } = store;
  const { searchAllWindows } = getState().general;
  const tabQueryOptions = {};
  if (!searchAllWindows) {
    tabQueryOptions.currentWindow = true;
  }
  return browser.tabs.query(tabQueryOptions)
    .then(tabs => Object.assign({}, store, { loadedTabs: tabs }))
    .catch((e) => {
      throw new Error(`Problem loading tabs during popup initialization: ${e}`);
    });
}

createUIStore()
  .then(addTabsToPromiseChain)
  .then(populateTabList)
  .then(addEventListeners)
  .catch((e) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(e);
    }
    throw new Error(`Ran into a problem initializing popup window: ${e}`);
  });

