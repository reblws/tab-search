import {
  normalizeRecentlyClosedTabs,
  normalizeBookmarks,
  normalizeHistory,
} from './normalize.js';

describe('normalizeRecentlyClosedTabs', function () {
  const session = tab => ({ lastModified: 0, tab: Object.assign({ incognito: false }, tab) });
  it('should hide new tab pages', function () {
    const results = normalizeRecentlyClosedTabs([
      session({ url: 'about:newtab' }),
      session({ url: 'chrome://newtab/' }),
      session({ url: 'https://example.com/' }),
    ]);
    expect(results.map(t => t.url)).to.deep.equal(['https://example.com/']);
  });

  it('should hide incognito tabs', function () {
    const results = normalizeRecentlyClosedTabs([
      session({ url: 'https://private.example/', incognito: true }),
      session({ url: 'https://example.com/' }),
    ]);
    expect(results.map(t => t.url)).to.deep.equal(['https://example.com/']);
  });

  it('should skip closed windows and annotate tabs as sessions', function () {
    const results = normalizeRecentlyClosedTabs([
      { lastModified: 0, window: { tabs: [] } },
      session({ url: 'https://example.com/' }),
    ]);
    expect(results).to.have.length(1);
    expect(results[0].type).to.equal('session');
  });
});

describe('normalizeBookmarks', function () {
  it('should return an empty array for no bookmarks', function () {
    expect(normalizeBookmarks(undefined)).to.deep.equal([]);
  });

  it('should skip urls without a hostname and use the encoded url as the id', function () {
    const results = normalizeBookmarks([
      { title: 'Places query', url: 'place:sort=8' },
      { title: 'Page', url: 'https://example.com/a b', dateAdded: 5 },
    ]);
    expect(results).to.deep.equal([{
      title: 'Page',
      url: 'https://example.com/a b',
      id: 'https://example.com/a%20b',
      type: 'bookmark',
      dateAdded: 5,
      lastAccessed: 5,
    }]);
  });
});

describe('normalizeHistory', function () {
  it('should annotate history items with their last visit', function () {
    const results = normalizeHistory([{ id: 'h', url: 'https://example.com/', lastVisitTime: 7 }]);
    expect(results[0]).to.include({ type: 'history', lastAccessed: 7 });
  });
});
