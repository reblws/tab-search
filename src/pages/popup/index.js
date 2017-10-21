/* Popup initialization */
import { createUIStore } from 'redux-webext';
import { addEventListeners } from './event-listeners';
import {
  addTabsToPromiseChain,
  addCurrentWindowIdToPromiseChain,
} from './utils/browser';

createUIStore()
  .then(addTabsToPromiseChain)
  .then(addCurrentWindowIdToPromiseChain)
  .then(addEventListeners)
  .catch((e) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(e);
    }
    throw new Error(`Ran into a problem initializing popup window: ${e}`);
  });

