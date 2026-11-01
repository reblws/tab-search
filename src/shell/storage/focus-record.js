import { createMemoryArea } from './memory-area';

const FOCUSED_AT_KEY = 'tabFocusedAt';
const STARTED_AT_KEY = 'tabRecencyStartedAt';

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
