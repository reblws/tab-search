/* Popup initialization */
import 'shell/platform/polyfill';
import { installRemoteApi, needsRemoteApi } from 'shell/platform/remote-api';
import { createUIStore } from 'shell/store/ui-store';
import { OVERLAY } from 'core/surface';
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
} from './tab-actions';
import { searchInput } from './nodes';
import {
  surface,
  startSurface,
  watchDismiss,
  framedByPage,
  claimOverlay,
} from './surface';

const UNCLAIMED_CLASSNAME = 'is-unclaimed';

function start() {
  // Firefox gives the overlay's frame only the content script APIs; the
  // background makes the other calls for it
  if (surface.surface === OVERLAY && needsRemoteApi(browser)) {
    installRemoteApi();
  }
  startSurface();
  watchDismiss();

  // The settings page shows the popup in a frame as a live preview; it must
  // not take the focus from the settings
  if (surface.focus === 'none') {
    searchInput().removeAttribute('autofocus');
  } else {
    focusSearchInputWorkaround();
  }
  // The overlay's frame takes the focus itself, at once, so the first keys
  // typed after opening it land in the search. The host script doesn't
  // focus the frame: in Chrome that blurs the input again. When the frame
  // gets the focus back later (from a page that took it), the search gets
  // it too.
  if (surface.surface === OVERLAY) {
    searchInput().focus();
    window.addEventListener('focus', () => {
      if (document.activeElement === document.body) searchInput().focus();
    });
  }

  return createUIStore()
    .then(applyPopupSize)
    .then(overrideDomStyleSheets)
    .then(addTabsToPromiseChain)
    .then(addCurrentWindowIdToPromiseChain)
    .then(addEventListeners)
    .then(doFinalSideEffects)
    .catch((e) => {
      throw new Error(`Ran into a problem initializing popup window: ${e.stack}`);
    });
}

// The page is web accessible for the overlay, so a site could frame it.
// It only starts in a frame that TabSearch's own host script made. Until
// the background says so it stays invisible but rendered: Chrome lets a
// cross-origin frame take the focus while it loads, not after a round trip.
if (framedByPage()) {
  const root = document.documentElement;
  root.classList.add(UNCLAIMED_CLASSNAME);
  if (surface.surface === OVERLAY) searchInput().focus();
  claimOverlay().then((valid) => {
    if (!valid) {
      root.hidden = true;
      return undefined;
    }
    root.classList.remove(UNCLAIMED_CLASSNAME);
    return start();
  });
} else {
  start();
}
