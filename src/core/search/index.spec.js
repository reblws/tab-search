import { initialFuzzySettings } from '../reducers/defaults.js';
import { searchTabs } from './index.js';

describe('most recently used sort', function () {
  const CURRENT_WINDOW = 2;
  const mruSettings = { shouldSortByMostRecentlyUsedOnPopup: true };
  const tab = (id, windowId, active, lastAccessed) => ({
    id, windowId, active, lastAccessed, title: `Tab ${id}`, url: `https://${id}.example/`,
  });
  const order = tabs => searchTabs('', { tabs }, initialFuzzySettings, mruSettings, {
    currentWindowId: CURRENT_WINDOW,
  }).map(t => t.id);

  it('should keep the active tab of another window in time order (#114)', function () {
    expect(order([
      tab(1, 1, false, 100),
      tab(2, 1, true, 200),
      tab(3, CURRENT_WINDOW, true, 300),
    ])).to.deep.equal([2, 1, 3]);
  });

  it('should push only the current tab to the bottom', function () {
    expect(order([
      tab(1, CURRENT_WINDOW, true, 400),
      tab(2, 1, true, 100),
      tab(3, 3, true, 300),
      tab(4, CURRENT_WINDOW, false, 200),
    ])).to.deep.equal([3, 4, 2, 1]);
  });
});

describe('searchTabs', function () {
  const tab = (id, windowId) => ({ id, windowId, title: `Tab ${id}`, url: `https://${id}.example/` });
  const deps = { currentWindowId: 1, deletedIds: new Set([2]) };

  it('should drop deleted tabs and annotate the rest by window', function () {
    const results = searchTabs('', { tabs: [tab(1, 1), tab(2, 1), tab(3, 2)] }, initialFuzzySettings, {}, deps);
    expect(results.map(t => [t.id, t.type])).to.deep.equal([[1, 'tab'], [3, 'other-window-tab']]);
  });

  it('should keep the type of extra sources', function () {
    const closed = { id: 9, url: 'https://9.example/', title: 'Closed', type: 'session' };
    const results = searchTabs('', { tabs: [tab(1, 1)], extras: [closed] }, initialFuzzySettings, {}, deps);
    expect(results.map(t => t.type)).to.deep.equal(['tab', 'session']);
  });
});
