import { createSessionFlag } from './session-flag.js';

function createStorageArea() {
  const items = {};
  return {
    items,
    get: key => Promise.resolve(key in items ? { [key]: items[key] } : {}),
    set: obj => Promise.resolve(Object.assign(items, obj)),
  };
}

const flush = () => new Promise(r => setTimeout(r, 0));

describe('createSessionFlag', function () {
  it('should keep the flag in session storage', async function () {
    const area = createStorageArea();
    await createSessionFlag('flag', area).set(true);
    // A restarted worker creates the flag again
    expect(await createSessionFlag('flag', area).get()).to.equal(true);
  });

  it('should keep the flag in memory without session storage', async function () {
    const flag = createSessionFlag('flag', undefined);
    expect(await flag.get()).to.equal(false);
    await flag.set(true);
    expect(await flag.get()).to.equal(true);
    await flush();
  });
});
