/* Popup initialization */
import { createUIStore } from 'redux-webext';
import addEventListeners from './event-listeners';
import { populateTabList } from './dom-utils';

// Add a key containing adding the current windowId to the popup.
const windowIdPromise = browser.windows.getCurrent()
  .then(({ id }) => ({ windowId: id }));
// Adds a key 'windowId' to the store object.
// Store object is now -> { dispatch, getState, subscribe, windowId }
const mergeStoreWithWindowId = promiseArray =>
  promiseArray.reduce((acc, obj) => Object.assign({}, acc, obj));

Promise.all([createUIStore(), windowIdPromise])
  .then(mergeStoreWithWindowId)
  .then(populateTabList)
  .then(addEventListeners)
  .catch((e) => {
    console.error(e);
    throw new Error('Ran into a problem initializing popup window.');
  });
