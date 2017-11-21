/* Popup initialization */
import { createUIStore } from 'redux-webext';
import {
  addEventListeners,
  doFinalSideEffects,
  focusSearchInputWorkaround,
} from './side-effects';
import {
  addTabsToPromiseChain,
  addCurrentWindowIdToPromiseChain,
} from './utils/browser';

focusSearchInputWorkaround();

createUIStore()
  .then(addTabsToPromiseChain)
  .then(addCurrentWindowIdToPromiseChain)
  .then(addEventListeners)
  .then(doFinalSideEffects)
  .catch((e) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(e);
    }
    throw new Error(`Ran into a problem initializing popup window: ${e}`);
  });

