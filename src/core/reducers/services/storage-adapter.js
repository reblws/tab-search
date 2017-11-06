// Redux-persist storage adapter for storage.local WebExtension API compatibility
const storage = browser.storage.local;

export default {
  getItem: key => storage.get(key).then(obj => obj[key]),
  setItem: (key, item) => {
    // Problem with original is that once we parse the stringified state
    // given by redux-persist, all the object-values are still stringified.

    // storage.local stores native JS values, all we do here is convert the
    // stringified state back into a POJO

    // This is a quick fix, only works 2 levels deep
    const stringifiedState = JSON.parse(item); // All its values are strings
    const parsedValues = Object.values(stringifiedState).map(JSON.parse);
    const parsedItem = Object.keys(stringifiedState)
      .map((k, index) => ({ [k]: parsedValues[index] }))
      .reduce((acc, val) => Object.assign({}, acc, val));
    return storage.set({ [key]: parsedItem });
  },
  removeItem: key => storage.remove(key),
};
