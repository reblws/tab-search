import { menuContext, menuTitles } from './menu-items.js';

describe('menuContext', function () {
  it('should open the tab menu for open tabs', function () {
    expect(menuContext({ id: '5', type: 'tab' })).to.deep.equal({ context: 'tab', tabId: 5 });
    expect(menuContext({ id: '9', type: 'other-window-tab' })).to.deep.equal({ context: 'tab', tabId: 9 });
  });

  it('should open the bookmark menu for bookmarks', function () {
    expect(menuContext({ id: 'b1', type: 'bookmark' })).to.deep.equal({ context: 'bookmark', bookmarkId: 'b1' });
  });

  it('should leave other rows alone', function () {
    ['session', 'history', undefined].forEach((type) => {
      expect(menuContext({ id: '1', type })).to.equal(null);
    });
  });
});

describe('menuTitles', function () {
  it('should name what Pin and Mute will do', function () {
    expect(menuTitles({ pinned: false, mutedInfo: { muted: false } }))
      .to.deep.equal({ 'tab-pin': 'Pin Tab', 'tab-mute': 'Mute Tab' });
    expect(menuTitles({ pinned: true, mutedInfo: { muted: true } }))
      .to.deep.equal({ 'tab-pin': 'Unpin Tab', 'tab-mute': 'Unmute Tab' });
  });
});
