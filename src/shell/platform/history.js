import { apiP } from './api';

// TODO: HISTORY_LIMIT should be a pref
const HISTORY_LIMIT = 25;
export function searchHistory(query) {
  return apiP(browser.history, 'search', {
    text: query,
    maxResults: HISTORY_LIMIT,
  });
}
