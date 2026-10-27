import { SESSION_TYPE, BOOKMARK_TYPE, HISTORY_TYPE } from 'core/tabs/types';
import { isOfUrl } from 'core/tabs/predicates';
import { annotateType, composeFilterAnd } from 'core/lib/fp';
import { encodeUrl, parseUrl, hasValidHostname } from 'core/lib/url';

// Each of these browser API results should be annotated with its proper
// type. Dom specific aspects of the object like favicon url are handled
// by the popup's render.tabToTag

// At minimum, each normalized object should have the following fields:
//        type: the typestring specified in core/tabs/types
//        id: retrieving this specific object should depend on this value
//        lastAccessed: when was this guy last accessed
//        url: link to the resource

// Should normalize results to match a tabs.Tab object as closely as possible
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/Tab

export function normalizeRecentlyClosedTabs(results) {
  // No incognito please
  const annotateSession = annotateType(SESSION_TYPE);
  const filterIncognito = ({ incognito }) => !incognito;
  // Don't want to show new tab pages
  const filterNewTab = x => !isOfUrl('about:newtab')(x)
    && !isOfUrl('chrome://newtab/')(x);
  const hasTab = x => 'tab' in x;
  // Keep a tab only if it passes every filter
  const filters = composeFilterAnd(
    filterNewTab,
    filterIncognito,
  );
  const normalize = sessionTabs => sessionTabs
    .reduce((acc, session) => {
      if (!hasTab(session) || !filters(session.tab)) {
        return acc;
      }
      return [...acc, annotateSession(session.tab)];
    }, []);
  return normalize(results);
}

export function normalizeBookmarks(bookmarks) {
  // TODO: should we dedup the bookmarks? if they're already in the search list
  //                This would require appending the bookmarks after the initial
  //                search

  // The bookmarks API throws an error if the query is falsey, so the caller
  // may have nothing to give
  if (!bookmarks) {
    return [];
  }

  // If a url is undefined or contains no valid hostname, that means
  // its probably a folder or bookmark we don't care about.
  const filterFolders = ({ url }) => hasValidHostname(parseUrl(url));

  // We can't open bookmarks by ID, instead we need to pass the url to
  // browser.tabs.create . Override the id property with the value of the url
  const urlAsId = tab => Object.assign({}, tab, { id: encodeUrl(tab.url) });

  // Type property is only available from bookmarks from FF57+, annotate the
  // bookmarks type for backward compatbility
  const normalize = bs =>
    bs.filter(filterFolders)
      .map(annotateType(BOOKMARK_TYPE))
      .map(urlAsId)
      .map(x => Object.assign(x, { lastAccessed: x.dateAdded || 1 }));
  // Treat date added bookmark as lastaccessed so we at least have a value
  return normalize(bookmarks);
}

export function normalizeHistory(historicalRecords) {
  if (!historicalRecords) {
    return [];
  }
  return historicalRecords.map(annotateType(HISTORY_TYPE))
    .map(x => Object.assign(x, { lastAccessed: x.lastVisitTime || 1 }));
}
