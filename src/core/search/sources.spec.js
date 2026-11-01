import { extraSources } from './sources.js';

describe('extraSources', function () {
  const all = { showHistory: true, showBookmarks: true, showRecentlyClosed: true };

  it('should search every source the settings turn on, in merge order', function () {
    expect(extraSources('long query', all)).to.deep.equal(['history', 'recentlyClosed', 'bookmarks']);
  });

  it('should skip history and bookmarks for queries of 3 characters or fewer', function () {
    expect(extraSources('abc', all)).to.deep.equal(['recentlyClosed']);
  });

  it('should skip sources that are turned off', function () {
    expect(extraSources('long query', { showHistory: false, showBookmarks: true, showRecentlyClosed: false }))
      .to.deep.equal(['bookmarks']);
  });
});
