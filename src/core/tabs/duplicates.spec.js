import { findDuplicateTabs } from './duplicates.js';

describe('findDuplicateTabs', function () {
  const tab = (url, lastAccessed, type = 'tab') => ({ type, url, lastAccessed });

  it('should close nothing when every url is unique', function () {
    expect(findDuplicateTabs([tab('a', 1), tab('b', 2)])).to.deep.equal([]);
  });

  it('should keep the most recently used tab of each url', function () {
    const items = [tab('a', 100), tab('b', 5), tab('a', 300), tab('a', 200)];
    expect(findDuplicateTabs(items)).to.deep.equal([0, 3]);
  });

  it('should read times stored as dataset strings', function () {
    expect(findDuplicateTabs([tab('a', '20'), tab('a', '100')])).to.deep.equal([0]);
  });

  it('should keep the first listed tab when times are missing or tie', function () {
    expect(findDuplicateTabs([tab('a', undefined), tab('a', 'undefined')])).to.deep.equal([1]);
    expect(findDuplicateTabs([tab('a', 7), tab('a', 7)])).to.deep.equal([1]);
  });

  it('should count tabs in other windows as open tabs', function () {
    const items = [tab('a', 1, 'other-window-tab'), tab('a', 2)];
    expect(findDuplicateTabs(items)).to.deep.equal([0]);
  });

  it('should never close recently closed tabs, bookmarks or history items', function () {
    const items = [
      tab('a', 9, 'session'),
      tab('a', 9, 'bookmark'),
      tab('a', 9, 'history'),
      tab('a', 1),
    ];
    expect(findDuplicateTabs(items)).to.deep.equal([]);
  });

  it('should ignore list rows without a type, like the no-result row', function () {
    expect(findDuplicateTabs([{}, {}])).to.deep.equal([]);
  });
});
