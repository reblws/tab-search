// Where this popup page is running (core/surface), and the parts of opening
// and closing that differ between the toolbar popup, the settings preview,
// the experimental overlay and the fallback window.
import { surfaceOf } from 'core/surface';
import {
  OVERLAY_READY,
  OVERLAY_CLOSE,
  OVERLAY_DISMISS,
  OVERLAY_CLAIM,
  CLOSE_ANIMATION_MS,
} from 'core/overlay/protocol';

const query = typeof window !== 'undefined' && window.location
  ? Object.fromEntries(new URLSearchParams(window.location.search))
  : {};
export const surface = surfaceOf(query);

const CLOSING_CLASSNAME = 'is-closing';
let closing = false;

function reducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// '*' because the frame can't know the page's origin. The host script only
// believes messages whose source is its frame and whose origin is the
// extension's, and "close" tells the page nothing.
function tellHost(type) {
  if (window.parent && window.parent !== window) window.parent.postMessage({ type }, '*');
}

// Closes the popup page however its surface closes. In the overlay, after
// a short fade, so nothing jumps.
export function closeUI() {
  switch (surface.close) {
    case 'window':
      window.close();
      return;
    case 'host': {
      if (closing) return;
      closing = true;
      document.documentElement.classList.add(CLOSING_CLASSNAME);
      const wait = reducedMotion() ? 0 : CLOSE_ANIMATION_MS;
      window.setTimeout(() => tellHost(OVERLAY_CLOSE), wait);
      return;
    }
    default:
  }
}

// Whether a page from another origin frames this one. The settings
// preview is the extension's own page, so it can look inside its parent.
export function framedByPage() {
  if (window.parent === window) return false;
  try {
    return !window.parent.location.href;
  } catch {
    return true;
  }
}

// Resolves true when the background confirms the token in the URL is the
// one TabSearch's host script registered for this tab, so a site that
// frames this page itself gets an empty frame
export function claimOverlay() {
  const token = window.location.hash.slice(1);
  if (surface.close !== 'host' || !token) return Promise.resolve(false);
  return browser.runtime.sendMessage({ type: OVERLAY_CLAIM, token })
    .then(reply => !!(reply && reply.valid), () => false);
}

// Marks the root for the surface's styles, and tells the host the frame
// is alive, so it can show it
export function startSurface() {
  document.documentElement.dataset.surface = surface.surface;
  if (surface.close === 'host') tellHost(OVERLAY_READY);
}

// Clicks on the backdrop (outside the panel), a dismiss from the host, and
// leaving the fallback window all close the page
export function watchDismiss() {
  const root = document.documentElement;
  if (surface.backdrop) {
    let pressedBackdrop = false;
    root.addEventListener('mousedown', (event) => {
      pressedBackdrop = event.target === root;
    });
    root.addEventListener('click', (event) => {
      if (pressedBackdrop && event.target === root) closeUI();
      pressedBackdrop = false;
    });
  }
  if (surface.close === 'host') {
    window.addEventListener('message', (event) => {
      if (event.source === window.parent && event.data && event.data.type === OVERLAY_DISMISS) {
        closeUI();
      }
    });
  }
  if (surface.closeOnBlur) window.addEventListener('blur', closeUI);
}
