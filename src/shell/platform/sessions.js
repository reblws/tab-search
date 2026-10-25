import { apiP } from './api';

// recentlyclosed func
export function getRecentlyClosed(maxResults) {
  return apiP(browser.sessions, 'getRecentlyClosed', { maxResults });
}

export function restoreSession(sessionId) {
  return browser.sessions.restore(sessionId);
}
