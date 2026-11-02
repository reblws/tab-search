// The experimental overlay (general.enableOverlay). While it's on, the
// toolbar button has no popup, so a click on it, or its shortcut, fires
// onClicked here instead: the background injects the host script
// (pages/overlay), which shows the popup page in a frame over the tab.
//
// The browser keeps extensions out of its own pages, like the new tab page,
// so there the click opens the toolbar popup as usual. So does any tab where
// injecting fails, or where the frame never says it's ready.
import { planOpen, INJECT } from 'core/overlay/open-plan';
import { centeredBounds } from 'core/overlay/bounds';
import { registerToken, claimToken } from 'core/overlay/tokens';
import {
  HOST_SCRIPT,
  OVERLAY_FAILED,
  OVERLAY_REGISTER,
  OVERLAY_CLAIM,
  POPUP_PATH,
  windowPath,
} from 'core/overlay/protocol';
import {
  browserName,
  setPopup,
  openPopup,
  addClickListener,
} from 'shell/platform/action-api';
import { executeScriptFile } from 'shell/platform/scripting';
import { getWindow, createPopupWindow } from 'shell/platform/windows';

const logError = what => (e) => {
  console.error(`TabSearch overlay: couldn't ${what}: ${(e && e.message) || e}`);
};

export function createOverlayLauncher({
  store,
  rehydrated,
  name = browserName,
  inject = tabId => executeScriptFile(tabId, HOST_SCRIPT),
  now = Date.now,
}) {
  let enabled = false;
  // One-time tokens the host script registers for its frame
  let tokens = {};
  const popupFor = on => (on ? '' : POPUP_PATH);
  const isEnabled = () => !!store.getState().general.enableOverlay;

  function openWindow(tab) {
    const windowId = tab && tab.windowId;
    return getWindow(windowId)
      .catch(() => undefined)
      .then(win => createPopupWindow(
        browser.runtime.getURL(windowPath(windowId)),
        centeredBounds(win),
      ));
  }

  // The toolbar popup, or a popup window where the browser won't open it.
  // Nothing here awaits before openPopup(): Firefox before 149 only opens
  // the popup within the click's user action, which ends at the first await.
  function openFallback(tab) {
    setPopup(POPUP_PATH);
    return openPopup()
      .catch(() => openWindow(tab))
      .catch(logError('open TabSearch'))
      .then(() => setPopup(popupFor(enabled)));
  }

  function openOverlay(tab) {
    if (planOpen(tab, name).open !== INJECT) return openFallback(tab);
    return inject(tab.id).then(
      () => undefined,
      () => openFallback(tab),
    );
  }

  // Follows the setting. Runs on every start, since Firefox forgets
  // setPopup() when it restarts
  const ready = rehydrated.then(() => {
    enabled = isEnabled();
    if (enabled) setPopup('');
    store.subscribe(() => {
      const next = isEnabled();
      if (next === enabled) return;
      enabled = next;
      Promise.resolve(setPopup(popupFor(next))).catch(logError('switch the toolbar popup'));
    });
  });

  return {
    ready,
    openOverlay,
    openFallback,
    // Add in the background's first turn, so a click wakes a stopped worker
    addListeners() {
      addClickListener(tab => openOverlay(tab));
      browser.runtime.onMessage.addListener((msg, sender) => {
        if (!msg || !sender || sender.id !== browser.runtime.id || !sender.tab) return undefined;
        const fromFrame = typeof sender.url === 'string'
          && sender.url.startsWith(browser.runtime.getURL(POPUP_PATH));
        const tabId = sender.tab.id;
        switch (msg.type) {
          case OVERLAY_FAILED:
            openFallback(sender.tab);
            return undefined;
          // From the host script, in the page
          case OVERLAY_REGISTER:
            if (fromFrame) return undefined;
            tokens = registerToken(tokens, { token: msg.token, tabId, now: now() });
            return Promise.resolve(true);
          // From the frame, which only starts when this says yes
          case OVERLAY_CLAIM: {
            if (!fromFrame) return undefined;
            const claim = claimToken(tokens, { token: msg.token, tabId, now: now() });
            tokens = claim.tokens;
            return Promise.resolve({ valid: claim.valid });
          }
          default:
            return undefined;
        }
      });
    },
  };
}
