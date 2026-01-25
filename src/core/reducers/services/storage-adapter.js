// Redux-persist storage adapter for storage.local WebExtension API compatibility
const storage = browser.storage.local;

export default {
  getItem: (key) => storage.get(key).then((obj) => obj[key]),
  setItem: (key, item) => storage.set({ [key]: item }),
  removeItem: (key) => storage.remove(key),
};
