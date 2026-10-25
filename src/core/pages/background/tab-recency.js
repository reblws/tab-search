// Records when each tab gets focus, for the most recently used sort (see
// core/tab-recency.js). A tab gets focus when it's activated in the focused
// window, or when its window gets focus.
import { GET_FOCUSED_AT } from 'core/tab-recency';

const FOCUSED_AT_KEY = 'tabFocusedAt';
const STARTED_AT_KEY = 'tabRecencyStartedAt';

// A click on a tab in another window focuses the window and then activates
// the tab. Waiting this long after the focus change records that tab, not
// the one that was active in the window for an instant
export const FOCUS_SETTLE_MS = 150;

// Same shape as a storage area, for browsers without storage.session
function createMemoryArea() {
  const items = {};
  return {
    get: keys => Promise.resolve([].concat(keys)
      .filter(key => key in items)
      .reduce((acc, key) => Object.assign(acc, { [key]: items[key] }), {})),
    set: (obj) => {
      Object.assign(items, obj);
      return Promise.resolve();
    },
  };
}

// Like createSessionFlag(): storage.session where there is one, so a stopped
// MV3 service worker keeps the record; memory on older Firefox, whose MV2
// background page lives for the whole session
export function createFocusRecord(
  area = browser.storage.session || createMemoryArea(),
  now = Date.now,
) {
  // Every read and write goes through one chain, so two quick events don't
  // lose a write
  let chain = area.get(STARTED_AT_KEY).then(items => (items[STARTED_AT_KEY]
    ? undefined
    : area.set({ [STARTED_AT_KEY]: now() })));
  const run = (fn) => {
    const next = chain.then(fn);
    // A failed write must not block the ones after it
    chain = next.catch((e) => {
      console.error(`Couldn't update tab focus times: ${e}`);
    });
    return next;
  };
  const loadFocusedAt = () => area.get(FOCUSED_AT_KEY)
    .then(items => items[FOCUSED_AT_KEY] || {});
  const saveFocusedAt = focusedAt => area.set({ [FOCUSED_AT_KEY]: focusedAt });
  return {
    // Keeps the later time: a focus change and a tab activation can report
    // the same switch out of order
    touch: (tabId, time) => run(() => loadFocusedAt().then(focusedAt => saveFocusedAt(
      Object.assign({}, focusedAt, { [tabId]: Math.max(focusedAt[tabId] || 0, time) }),
    ))),
    forget: tabId => run(() => loadFocusedAt().then((focusedAt) => {
      const rest = Object.assign({}, focusedAt);
      delete rest[tabId];
      return saveFocusedAt(rest);
    })),
    all: () => run(() => area.get([FOCUSED_AT_KEY, STARTED_AT_KEY]).then(items => ({
      focusedAt: items[FOCUSED_AT_KEY] || {},
      startedAt: items[STARTED_AT_KEY],
    }))),
  };
}

// Add these in the first turn so the events wake a stopped MV3 service worker
export function addTabRecencyListeners(
  record,
  { now = Date.now, settleMs = FOCUS_SETTLE_MS } = {},
) {
  const logError = (e) => {
    console.error(`Couldn't record tab focus: ${e}`);
  };
  browser.tabs.onActivated.addListener(({ tabId, windowId }) => {
    const time = now();
    browser.windows.get(windowId)
      .then(({ focused }) => focused && record.touch(tabId, time))
      .catch(logError);
  });
  browser.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === browser.windows.WINDOW_ID_NONE) return;
    const time = now();
    setTimeout(() => {
      browser.tabs.query({ active: true, windowId })
        .then(([tab]) => tab && record.touch(tab.id, time))
        .catch(logError);
    }, settleMs);
  });
  browser.tabs.onRemoved.addListener((tabId) => {
    record.forget(tabId).catch(logError);
  });
  browser.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === GET_FOCUSED_AT) {
      return record.all();
    }
    return undefined;
  });
}
