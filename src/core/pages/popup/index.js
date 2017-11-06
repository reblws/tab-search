/* Popup initialization */
import { createUIStore } from 'redux-webext';
import { addEventListeners } from './event-listeners';
import {
  addTabsToPromiseChain,
  addCurrentWindowIdToPromiseChain,
} from './utils/browser';
import { overrideFontStylesWithSansSerif } from './utils/dom';

createUIStore()
  .then(addTabsToPromiseChain)
  .then(addCurrentWindowIdToPromiseChain)
  .then(addEventListeners)
  .then(doSideEffects)
  .catch((e) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(e);
    }
    throw new Error(`Ran into a problem initializing popup window: ${e}`);
  });

function doSideEffects(store) {
  const { useFallbackFont } = store.getState().general;
  if (useFallbackFont) {
    // Lazy for now: Just override the css styles specifying a font-family
    overrideFontStylesWithSansSerif();
  }
}
