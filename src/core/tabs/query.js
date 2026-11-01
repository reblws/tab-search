// The browser.tabs.query() options for the tabs the popup searches
export function tabQueryOptions({ searchAllWindows, ignorePinnedTabs }) {
  return Object.assign(
    {},
    searchAllWindows ? {} : { currentWindow: true },
    ignorePinnedTabs ? { pinned: false } : {},
  );
}
