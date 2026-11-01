// Records when each tab gets focus, for the most recently used sort (see
// core/tabs/recency.js and shell/storage/focus-record.js). A tab gets focus
// when it's activated in the focused window, or when its window gets focus.
import { GET_FOCUSED_AT } from 'core/tabs/recency';

// A click on a tab in another window focuses the window and then activates
// the tab. Waiting this long after the focus change records that tab, not
// the one that was active in the window for an instant
export const FOCUS_SETTLE_MS = 150;

// Add these in the first turn so the events wake a stopped MV3 service worker
export function addTabRecencyListeners(
  record,
  { now = Date.now, settleMs = FOCUS_SETTLE_MS } = {},
) {
  const logError = (e) => {
    console.error(`Couldn't record tab focus: ${e}`);
  };
  browser.tabs.onActivated.addListener(({ tabId, windowId }) => {
    const time = now();
    browser.windows.get(windowId)
      .then(({ focused }) => focused && record.touch(tabId, time))
      .catch(logError);
  });
  browser.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === browser.windows.WINDOW_ID_NONE) return;
    const time = now();
    setTimeout(() => {
      browser.tabs.query({ active: true, windowId })
        .then(([tab]) => tab && record.touch(tab.id, time))
        .catch(logError);
    }, settleMs);
  });
  browser.tabs.onRemoved.addListener((tabId) => {
    record.forget(tabId).catch(logError);
  });
  browser.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === GET_FOCUSED_AT) {
      return record.all();
    }
    return undefined;
  });
}
