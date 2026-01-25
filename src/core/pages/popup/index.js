/* Popup initialization */
import { createUIStore } from 'redux-webext';
import {
  addEventListeners,
  doFinalSideEffects,
  focusSearchInputWorkaround,
  overrideDomStyleSheets,
} from './side-effects';
import {
  addTabsToPromiseChain,
  addCurrentWindowIdToPromiseChain,
} from './utils/browser';

focusSearchInputWorkaround();

createUIStore()
  .then(overrideDomStyleSheets)
  .then(addTabsToPromiseChain)
  .then(addCurrentWindowIdToPromiseChain)
  .then(addEventListeners)
  .then(doFinalSideEffects)
  .catch((e) => {
    console.error(e);
    throw new Error(`Ran into a problem initializing popup window: ${e.stack}`);
  });
