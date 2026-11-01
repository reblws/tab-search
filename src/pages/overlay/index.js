// Host script for the experimental overlay. The background injects this file
// into the tab on every click of the toolbar button: the first click shows
// the overlay, the next one dismisses it.
import 'shell/platform/polyfill';
import {
  OVERLAY_FAILED,
  OVERLAY_REGISTER,
  HOST_KEY,
  overlayUrl,
} from 'core/overlay/protocol';
import { mountOverlay } from './host';

function newToken() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// The content script's own window; page scripts can't see this property
const open = window[HOST_KEY];
if (open && typeof open.dismiss === 'function') {
  open.dismiss();
} else if (!open) {
  // Taken while the token is on its way, so a quick second click waits
  window[HOST_KEY] = { pending: true };
  const token = newToken();
  const failed = () => {
    delete window[HOST_KEY];
    browser.runtime.sendMessage({ type: OVERLAY_FAILED }).catch(() => {});
  };
  browser.runtime.sendMessage({ type: OVERLAY_REGISTER, token })
    .then(() => {
      window[HOST_KEY] = mountOverlay({
        src: browser.runtime.getURL(overlayUrl(token)),
        origin: browser.runtime.getURL('').replace(/\/$/, ''),
        onFailed: failed,
        onClosed: () => {
          delete window[HOST_KEY];
        },
      });
    }, failed);
}
