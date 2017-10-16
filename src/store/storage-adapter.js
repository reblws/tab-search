// Redux-persist storage adapter for storage.local WebExtension API compatibility
const storage = browser.storage.local;

export default {
  getItem: key => storage.get(key).then(JSON.parse),
  setItem: (key, item) => storage.set({ [key]: JSON.stringify(item) }),
  removeItem: key => storage.remove(key),
};
