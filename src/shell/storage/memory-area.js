// Same shape as a storage area, for browsers without storage.session
export function createMemoryArea() {
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
