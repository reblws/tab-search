import { rowView } from './row.js';

describe('rowView', function () {
  const icons = { history: 'H', bookmark: 'B', fallback: 'F' };
  const settings = {
    tabUrlSize: 11, tabTitleSize: 13, showVisualDeleteTabButton: false, oneLineTabTitles: false,
  };
  const deps = { icons, badFavIcons: new Set() };
  const tab = (extra = {}) => Object.assign({
    id: 4, type: 'tab', url: 'https://a.test', title: 'A', windowId: 1, lastAccessed: 50, favIconUrl: 'fav.png',
  }, extra);

  it('should carry the values the popup reads back off the row', function () {
    expect(rowView(tab(), settings, deps).dataset).to.deep.equal({
      id: '4', type: 'tab', window: '1', url: 'https://a.test', lastAccessed: '50',
    });
  });

  it('should use the session id for recently closed tabs', function () {
    expect(rowView(tab({ type: 'session', sessionId: 's9' }), settings, deps).dataset.id).to.equal('s9');
  });

  it('should pick the icon by type and favicon', function () {
    const icon = (t, d = deps) => rowView(tab(t), settings, d).iconSrc;
    expect(icon({})).to.equal('fav.png');
    expect(icon({ type: 'history' })).to.equal('H');
    expect(icon({ type: 'bookmark' })).to.equal('B');
    expect(icon({ favIconUrl: undefined })).to.equal('F');
    expect(icon({}, { icons, badFavIcons: new Set(['fav.png']) })).to.equal('F');
  });

  it('should only inline font sizes that differ from the defaults', function () {
    const view = rowView(tab(), settings, deps);
    expect(view.title.fontSize).to.equal(null);
    expect(view.url.fontSize).to.equal(null);
    const bigger = rowView(tab(), Object.assign({}, settings, { tabUrlSize: 14, tabTitleSize: 16 }), deps);
    expect(bigger.title.fontSize).to.equal(16);
    expect(bigger.url.fontSize).to.equal(14);
  });

  it('should hide the url at font size 0', function () {
    expect(rowView(tab(), Object.assign({}, settings, { tabUrlSize: 0 }), deps).url).to.equal(null);
  });

  it('should break long words unless titles are one line', function () {
    const long = tab({ title: 'x'.repeat(41) });
    expect(rowView(long, settings, deps).title.wrap).to.equal('breakAll');
    expect(rowView(tab(), settings, deps).title.wrap).to.equal(null);
    const oneLine = Object.assign({}, settings, { oneLineTabTitles: true });
    expect(rowView(long, oneLine, deps).title.wrap).to.equal('nowrap');
  });

  it('should show the delete button on open tabs when the setting is on', function () {
    const on = Object.assign({}, settings, { showVisualDeleteTabButton: true });
    expect(rowView(tab(), on, deps).deleteButton).to.equal(true);
    expect(rowView(tab({ type: 'other-window-tab' }), on, deps).deleteButton).to.equal(true);
    expect(rowView(tab({ type: 'bookmark' }), on, deps).deleteButton).to.equal(false);
    expect(rowView(tab(), settings, deps).deleteButton).to.equal(false);
  });

  it('should flag pinned, audible, muted and active tabs', function () {
    const view = rowView(tab({
      pinned: true, audible: true, mutedInfo: { muted: true }, isActive: true,
    }), settings, deps);
    expect([view.pinned, view.audible, view.muted, view.active]).to.deep.equal([true, true, true, true]);
    const plain = rowView(tab(), settings, deps);
    expect([plain.pinned, plain.audible, plain.muted, plain.active]).to.deep.equal([false, false, false, false]);
  });
});
