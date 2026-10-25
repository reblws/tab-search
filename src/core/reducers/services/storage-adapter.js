// Redux-persist storage adapter for a WebExtension storage area
// (storage.local, storage.session)
export const createStorageAdapter = area => ({
  getItem: key => area.get(key).then(obj => obj[key]),
  setItem: (key, item) => area.set({ [key]: item }),
  removeItem: key => area.remove(key),
});
