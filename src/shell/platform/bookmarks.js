import { apiP } from './api';

export function searchBookmarks(query) {
  return apiP(browser.bookmarks, 'search', query);
}
