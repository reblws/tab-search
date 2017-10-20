import Fuse from 'fuse.js';

const annotateType = type => tab => Object.assign({}, tab, { type });

export default function filterResults(
  query,
  options,
  {
    showRecentlyClosed,
    recentlyClosedLimit,
  },
) {
  return function promiseTabResults(loadedTabs) {
    const tabsToSearch = loadedTabs.map(annotateType('tab'));
    return showRecentlyClosed
      ? Promise.all([
        tabsToSearch,
        getRecentlyClosed(recentlyClosedLimit),
      ]).then(([tabs, sessions]) => [...tabs, ...sessions])
      : Promise.resolve(new Fuse(tabsToSearch, options).search(query));
  };
}

function getRecentlyClosed(maxResults) {
  const tab = ({ tab: _tab }) => _tab;
  return browser.sessions.getRecentlyClosed({ maxResults })
    .then(sessionObjects =>
      sessionObjects.filter(tab).map(tab).map(annotateType('session')),
    )
    .then(x => { console.log('sessions', x); return x; });
}

