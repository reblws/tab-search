// When each tab last had focus, for the most recently used sort. The
// background records it (pages/background/tab-recency.js) because the
// browser's tab.lastAccessed can't order tabs across windows: Firefox
// reports "now" for the selected tab of every window, and Chrome doesn't
// update it when a window gets focus (reblws/tab-search#114).
export const GET_FOCUSED_AT = 'tab-recency/get-focused-at';

// Puts the recorded focus times into lastAccessed. A tab with no record
// hasn't had focus since the background started, so it can't be more
// recent than that
export function withFocusTimes(tabs, { focusedAt = {}, startedAt } = {}) {
  return tabs.map((tab) => {
    if (Object.prototype.hasOwnProperty.call(focusedAt, tab.id)) {
      return Object.assign({}, tab, { lastAccessed: focusedAt[tab.id] });
    }
    if (startedAt && tab.lastAccessed > startedAt) {
      return Object.assign({}, tab, { lastAccessed: startedAt });
    }
    return tab;
  });
}
