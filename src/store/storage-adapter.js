// Storage adapter for storage.local WebExtension API compatibility with
// redux-persist v5

const storage = browser.storage.local;

export default {
  getItem: key => storage.get(key),
  setItem: (key, item) => storage.set({ [key]: item }),
  removeItem: key => storage.remove(key),
};
