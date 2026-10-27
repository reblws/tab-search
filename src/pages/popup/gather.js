import { getRecentlyClosed } from 'shell/platform/sessions';
import { searchBookmarks } from 'shell/platform/bookmarks';
import { searchHistory } from 'shell/platform/history';
import {
  normalizeHistory,
  normalizeBookmarks,
  normalizeRecentlyClosedTabs,
} from 'core/search/normalize';

// Minimum query length required to search extra browser apis (history and bookmarks)
const MIN_QUERY_LENGTH = 3;

// Resolves to the normalized extra sources the settings ask for. A source
// that fails is logged and left out
export function gatherExtras(query, {
  showHistory,
  showBookmarks,
  showRecentlyClosed,
  recentlyClosedLimit,
}) {
  const hasMinQueryLen = query.length > MIN_QUERY_LENGTH;
  const extraSourcesP = [];
  if (showHistory && hasMinQueryLen) {
    extraSourcesP.push(
      searchHistory(query).then(normalizeHistory)
        .catch((e) => {
          console.error(`Had trouble searching history: ${e}`);
          return [];
        }),
    );
  }
  if (showRecentlyClosed) {
    extraSourcesP.push(
      getRecentlyClosed(recentlyClosedLimit)
        .then(normalizeRecentlyClosedTabs)
        .catch((e) => {
          console.error(`Had trouble getting recently closed tabs: ${e}`);
          return [];
        }),
    );
  }
  if (showBookmarks && hasMinQueryLen) {
    extraSourcesP.push(
      searchBookmarks(query)
        .then(normalizeBookmarks)
        .catch((e) => {
          console.error(`Had trouble querying bookmarks: ${e}`);
          return [];
        }),
    );
  }
  return Promise.all(extraSourcesP).then(xs => [].concat(...xs));
}
