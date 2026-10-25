/* Popup initialization */
import 'core/polyfill';
import { createUIStore } from 'core/store/ui-store';
import {
  addEventListeners,
  doFinalSideEffects,
  focusSearchInputWorkaround,
  applyPopupSize,
  overrideDomStyleSheets,
} from './side-effects';
import {
  addTabsToPromiseChain,
  addCurrentWindowIdToPromiseChain,
} from './utils/browser';

focusSearchInputWorkaround();

createUIStore()
  .then(applyPopupSize)
  .then(overrideDomStyleSheets)
  .then(addTabsToPromiseChain)
  .then(addCurrentWindowIdToPromiseChain)
  .then(addEventListeners)
  .then(doFinalSideEffects)
  .catch((e) => {
    throw new Error(`Ran into a problem initializing popup window: ${e.stack}`);
  });

