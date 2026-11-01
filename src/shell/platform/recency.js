import { GET_FOCUSED_AT } from 'core/tabs/recency';

// Asks the background when each tab last had focus. Without the reply the
// sort falls back to the browser's lastAccessed
export function fetchFocusTimes() {
  return browser.runtime.sendMessage({ type: GET_FOCUSED_AT }).catch((e) => {
    console.error(`Couldn't get tab focus times: ${e}`);
  });
}
