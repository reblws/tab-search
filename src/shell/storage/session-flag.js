// A boolean that lasts for the browser session. A stopped MV3 service
// worker loses its memory, so keep it in storage.session where there is
// one; an MV2 background page lives for the whole session, so memory is
// enough there.
export function createSessionFlag(key, area = browser.storage.session) {
  if (!area) {
    let value = false;
    return {
      get: () => Promise.resolve(value),
      set: (next) => {
        value = next;
        return Promise.resolve();
      },
    };
  }
  return {
    get: () => area.get(key).then(items => Boolean(items[key])),
    set: next => area.set({ [key]: next }),
  };
}
