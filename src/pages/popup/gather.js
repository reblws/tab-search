import { getRecentlyClosed } from 'shell/platform/sessions';
import { searchBookmarks } from 'shell/platform/bookmarks';
import { searchHistory } from 'shell/platform/history';
import {
  normalizeHistory,
  normalizeBookmarks,
  normalizeRecentlyClosedTabs,
} from 'core/search/normalize';
import { extraSources } from 'core/search/sources';

const FETCHERS = {
  history: {
    label: 'searching history',
    fetch: query => searchHistory(query).then(normalizeHistory),
  },
  recentlyClosed: {
    label: 'getting recently closed tabs',
    fetch: (query, { recentlyClosedLimit }) =>
      getRecentlyClosed(recentlyClosedLimit).then(normalizeRecentlyClosedTabs),
  },
  bookmarks: {
    label: 'querying bookmarks',
    fetch: query => searchBookmarks(query).then(normalizeBookmarks),
  },
};

// Resolves to the normalized extra sources the settings ask for. A source
// that fails is logged and left out
export function gatherExtras(query, generalSettings) {
  return Promise.all(extraSources(query, generalSettings).map((source) => {
    const { label, fetch } = FETCHERS[source];
    return fetch(query, generalSettings).catch((e) => {
      console.error(`Had trouble ${label}: ${e}`);
      return [];
    });
  })).then(xs => [].concat(...xs));
}
