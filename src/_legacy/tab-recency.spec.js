import { withFocusTimes } from './tab-recency.js';

describe('withFocusTimes', function () {
  const times = tabs => tabs.map(t => t.lastAccessed);

  it('should use the recorded focus time', function () {
    const tabs = [{ id: 1, lastAccessed: 100 }, { id: 2, lastAccessed: 200 }];
    const result = withFocusTimes(tabs, { focusedAt: { 1: 500 }, startedAt: 1000 });
    expect(times(result)).to.deep.equal([500, 200]);
  });

  it('should cap a tab with no record at the start time', function () {
    // Firefox reports "now" for the selected tab of every window
    const tabs = [{ id: 1, active: true, lastAccessed: 9000 }, { id: 2, lastAccessed: 100 }];
    const result = withFocusTimes(tabs, { focusedAt: {}, startedAt: 1000 });
    expect(times(result)).to.deep.equal([1000, 100]);
  });

  it('should keep the browser times without a reply from the background', function () {
    const tabs = [{ id: 1, lastAccessed: 9000 }];
    expect(withFocusTimes(tabs, undefined)).to.deep.equal(tabs);
  });

  it('should not change the tabs it gets', function () {
    const tabs = [{ id: 1, lastAccessed: 100 }];
    withFocusTimes(tabs, { focusedAt: { 1: 500 } });
    expect(tabs[0].lastAccessed).to.equal(100);
  });
});
