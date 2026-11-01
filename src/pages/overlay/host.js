// The overlay's host in the web page: one element, with the popup page in a
// frame inside its shadow root, laid over the whole viewport. The frame
// draws its own backdrop and panel, so a click anywhere reaches TabSearch,
// not the page, and the page's styles and key handlers never see it.
import {
  OVERLAY_READY,
  OVERLAY_CLOSE,
  OVERLAY_DISMISS,
  READY_TIMEOUT_MS,
} from 'core/overlay/protocol';

export const HOST_TAG = 'tabsearch-overlay';
// How long the frame gets to animate its own way out after a dismiss
const DISMISS_GRACE_MS = 400;
// Fullscreen elements that can't hold the host as a child
const REPLACED = ['VIDEO', 'IFRAME', 'CANVAS', 'IMG', 'EMBED', 'OBJECT', 'AUDIO'];

// Inline !important beats any page rule, so the page can't move or hide it.
// CSSOM writes also get past a page's style-src CSP, unlike <style>.
function setStyles(node, styles) {
  Object.keys(styles).forEach(name => node.style.setProperty(name, styles[name], 'important'));
}

const HOST_STYLES = {
  all: 'initial',
  display: 'block',
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  width: '100%',
  height: '100%',
  margin: '0',
  padding: '0',
  border: '0',
  background: 'transparent',
  'z-index': '2147483647',
  // Shown once the frame says it's ready, so it never flashes unstyled
  opacity: '0',
  transition: 'none',
};

// Where the host goes. A modal <dialog> makes the rest of the page inert,
// so the host has to sit inside it to get clicks and focus
function mountPoint(doc) {
  const full = doc.fullscreenElement;
  if (full && !REPLACED.includes(full.tagName)) return full;
  let modal = null;
  try {
    modal = doc.querySelector('dialog:modal');
  } catch {
    // :modal is newer than the browsers TabSearch supports
  }
  return modal || doc.documentElement;
}

// src: the frame's URL; origin: the extension's origin, for checking who
// sent a message; onFailed: called when the frame never says it's ready.
// Returns close(), which removes the host; dismiss() asks the frame to
// animate out first.
export function mountOverlay({
  src,
  origin,
  doc = document,
  win = window,
  onFailed = () => {},
  onClosed = () => {},
  readyTimeoutMs = READY_TIMEOUT_MS,
}) {
  const returnFocus = doc.activeElement;
  // A video in fullscreen can't show the host on top of it
  const full = doc.fullscreenElement;
  if (full && REPLACED.includes(full.tagName) && doc.exitFullscreen) {
    doc.exitFullscreen().catch(() => {});
  }

  const host = doc.createElement(HOST_TAG);
  setStyles(host, HOST_STYLES);
  const frame = doc.createElement('iframe');
  frame.setAttribute('title', 'TabSearch');
  frame.setAttribute('allowtransparency', 'true');
  setStyles(frame, {
    display: 'block',
    width: '100%',
    height: '100%',
    margin: '0',
    padding: '0',
    border: '0',
    background: 'transparent',
    // Must match the popup page's root, or the browser paints the frame
    // opaque when the page's color scheme differs from it
    'color-scheme': 'light dark',
  });
  frame.src = src;
  // Open, so WebDriver can reach the frame; the frame's document is
  // cross-origin to the page either way
  host.attachShadow({ mode: 'open' }).append(frame);

  let closed = false;
  let dismissTimer = null;
  const readyTimer = win.setTimeout(() => {
    close();
    onFailed();
  }, readyTimeoutMs);

  function onMessage(event) {
    if (event.source !== frame.contentWindow || event.origin !== origin) return;
    const type = event.data && event.data.type;
    if (type === OVERLAY_READY) {
      win.clearTimeout(readyTimer);
      host.style.setProperty('opacity', '1', 'important');
      // The frame focuses its search itself when it can. When Chrome didn't
      // let it (it loaded too late after the click), focusing the frame
      // hands it the focus, and the frame moves it to the search. Not when
      // it already has it: in Chrome that would blur the search again.
      if (doc.activeElement !== host) frame.focus();
    } else if (type === OVERLAY_CLOSE) {
      close();
    }
  }
  // Focus traps in the page (modal libraries) pull focus back when it moves
  // somewhere else; this hides the move into the overlay from them
  function guardFocus(event) {
    if (event.target === host) event.stopImmediatePropagation();
  }
  // Escape still works if the page took the focus out of the frame
  function onKeydown(event) {
    if (event.key === 'Escape' && event.target !== host) {
      event.stopImmediatePropagation();
      event.preventDefault();
      close();
    }
  }
  function onHidden() {
    if (doc.visibilityState === 'hidden') close();
  }

  win.addEventListener('message', onMessage);
  win.addEventListener('focusin', guardFocus, true);
  win.addEventListener('keydown', onKeydown, true);
  win.addEventListener('pagehide', close);
  doc.addEventListener('visibilitychange', onHidden);
  mountPoint(doc).appendChild(host);

  function close() {
    if (closed) return;
    closed = true;
    win.clearTimeout(readyTimer);
    win.clearTimeout(dismissTimer);
    win.removeEventListener('message', onMessage);
    win.removeEventListener('focusin', guardFocus, true);
    win.removeEventListener('keydown', onKeydown, true);
    win.removeEventListener('pagehide', close);
    doc.removeEventListener('visibilitychange', onHidden);
    host.remove();
    if (returnFocus && returnFocus !== doc.body && returnFocus.isConnected
      && typeof returnFocus.focus === 'function') {
      returnFocus.focus({ preventScroll: true });
    }
    onClosed();
  }

  function dismiss() {
    if (closed) return;
    if (frame.contentWindow) frame.contentWindow.postMessage({ type: OVERLAY_DISMISS }, origin);
    dismissTimer = win.setTimeout(close, DISMISS_GRACE_MS);
  }

  return { close, dismiss, host, frame };
}
