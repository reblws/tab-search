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
import { searchInput } from './constants';

// The settings page shows the popup in a frame as a live preview; it must
// not take the focus from the settings
const isPreview = new URLSearchParams(window.location.search).has('preview');
if (isPreview) {
  searchInput.removeAttribute('autofocus');
} else {
  focusSearchInputWorkaround();
}

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

