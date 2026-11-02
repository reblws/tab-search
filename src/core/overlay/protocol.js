// Names shared by the background, the host script in the page and the
// popup page running as the overlay.

// The popup page, as the overlay loads it in its frame
export const OVERLAY_PATH = 'popup/index.html?surface=overlay';
export const POPUP_PATH = 'popup/index.html';
export const HOST_SCRIPT = '/overlay_bundle.js';
export const windowPath = windowId => `popup/index.html?surface=window&from=${windowId}`;

// window.postMessage types, from the overlay frame to the host script:
// alive once its script runs, ready once it has drawn the list and wants
// to be seen (it animates itself in)
export const OVERLAY_ALIVE = 'tabsearch/overlay-alive';
export const OVERLAY_READY = 'tabsearch/overlay-ready';
export const OVERLAY_CLOSE = 'tabsearch/overlay-close';
// and from the host script to the frame, to have it animate out and close
export const OVERLAY_DISMISS = 'tabsearch/overlay-dismiss';

// runtime message, from the host script to the background, when the frame
// never said it was ready (a page CSP with `sandbox` stops it, for one)
export const OVERLAY_FAILED = 'tabsearch/overlay-failed';
export const READY_TIMEOUT_MS = 1500;
// How long a live frame gets to draw before the host gives up on it, and
// how long the frame waits for its first list before showing anyway
export const DRAW_TIMEOUT_MS = 4000;
export const REVEAL_CAP_MS = 400;

// The popup page is web accessible so the host script can frame it, which
// means any site could frame it too and show the user's tabs inside its own
// page. So the host script registers a one-time token with the background
// and puts it in the frame's URL; a framed popup page only starts once the
// background confirms the token is for the tab it's in.
export const OVERLAY_REGISTER = 'tabsearch/overlay-register';
export const OVERLAY_CLAIM = 'tabsearch/overlay-claim';
export const TOKEN_TTL_MS = 10000;
export const overlayUrl = token => `${OVERLAY_PATH}#${token}`;

// The property on the content script's window that holds the open overlay's
// close function. The isolated world keeps it from page scripts.
export const HOST_KEY = '__tabsearchOverlay';

// How long the overlay's closing animation runs before the frame goes away
export const CLOSE_ANIMATION_MS = 110;
// How long the result rows of the opening animation take, so later
// renders (typing) don't replay it
export const OPENING_ANIMATION_MS = 450;
