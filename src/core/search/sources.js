// History and bookmarks are only searched past this many characters
const MIN_QUERY_LENGTH = 3;

// The extra sources to search alongside the open tabs, in merge order:
// 'history', 'recentlyClosed', 'bookmarks'
export function extraSources(query, { showHistory, showBookmarks, showRecentlyClosed }) {
  const longEnough = query.length > MIN_QUERY_LENGTH;
  return [
    showHistory && longEnough && 'history',
    showRecentlyClosed && 'recentlyClosed',
    showBookmarks && longEnough && 'bookmarks',
  ].filter(Boolean);
}
