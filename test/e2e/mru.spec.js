import { openPopup, openSettings } from './helpers/extension.js';

// Firefox reports lastAccessed = now for the selected tab of every window, so
// only the background's focus times can order them (reblws/tab-search#114).
// The popup page runs in a normal tab here, so that tab is the current tab
describe('Most recently used order', function () {
  let created = null;

  before(async function () {
    await openSettings();
    const checkbox = await $('#shouldSortByMostRecentlyUsedOnPopup');
    await checkbox.waitForExist({ timeout: 5000 });
    if (!(await checkbox.isSelected())) {
      await browser.execute(() => document.getElementById('shouldSortByMostRecentlyUsedOnPopup').click());
    }
    // Let the setting reach the background store
    await browser.pause(500);
  });

  after(async function () {
    if (!created) return;
    await browser.execute(windowIds => Promise.all(
      windowIds.map(id => browser.windows.remove(id)),
    ), created.windowIds);
  });

  it('should list the tabs of other windows in the order they were used', async function () {
    await openPopup();
    // Use tab a, then b (both in window 1), then c (window 2), then come back
    // No named functions in here: wdio's esbuild adds a __name() helper that
    // the page doesn't have
    created = await browser.execute((settleMs) => {
      const ids = {};
      return browser.tabs.getCurrent()
        .then((self) => { ids.self = self; })
        .then(() => browser.windows.create({ url: 'about:blank#a' }))
        .then((w1) => {
          ids.w1 = w1.id;
          ids.a = w1.tabs[0].id;
          return browser.tabs.create({ windowId: w1.id, url: 'about:blank#b', active: false });
        })
        .then((b) => { ids.b = b.id; })
        .then(() => browser.windows.create({ url: 'about:blank#c' }))
        .then((w2) => {
          ids.w2 = w2.id;
          ids.c = w2.tabs[0].id;
        })
        .then(() => browser.windows.update(ids.w1, { focused: true }))
        .then(() => new Promise(r => setTimeout(r, settleMs)))
        .then(() => browser.tabs.update(ids.a, { active: true }))
        .then(() => new Promise(r => setTimeout(r, settleMs)))
        .then(() => browser.tabs.update(ids.b, { active: true }))
        .then(() => new Promise(r => setTimeout(r, settleMs)))
        .then(() => browser.windows.update(ids.w2, { focused: true }))
        .then(() => new Promise(r => setTimeout(r, settleMs)))
        .then(() => browser.windows.update(ids.self.windowId, { focused: true }))
        .then(() => new Promise(r => setTimeout(r, settleMs)))
        .then(() => ({
          a: ids.a,
          b: ids.b,
          c: ids.c,
          self: ids.self.id,
          windowIds: [ids.w1, ids.w2],
        }));
    }, 400);

    await openPopup();
    await $(`.tab-object[data-id="${created.c}"]`).waitForExist({ timeout: 5000 });
    const shown = await browser.execute(() => Array.from(
      document.querySelectorAll('.tab-object'),
      node => Number(node.getAttribute('data-id')),
    ));
    const ours = [created.c, created.b, created.a, created.self];
    expect(shown.filter(id => ours.includes(id))).toEqual(ours);
  });
});
