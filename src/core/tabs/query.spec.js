import { tabQueryOptions } from './query.js';

describe('tabQueryOptions', function () {
  it('should limit the query to the current window and unpinned tabs as set', function () {
    expect(tabQueryOptions({ searchAllWindows: false, ignorePinnedTabs: true }))
      .to.deep.equal({ currentWindow: true, pinned: false });
    expect(tabQueryOptions({ searchAllWindows: true, ignorePinnedTabs: false })).to.deep.equal({});
  });
});
