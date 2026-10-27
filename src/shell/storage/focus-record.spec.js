import { createFocusRecord } from './focus-record.js';

function createStorageArea() {
  const items = {};
  return {
    items,
    get: keys => Promise.resolve([].concat(keys)
      .filter(key => key in items)
      .reduce((acc, key) => Object.assign(acc, { [key]: items[key] }), {})),
    set: obj => Promise.resolve(Object.assign(items, obj)),
  };
}

describe('createFocusRecord', function () {
  it('should keep the last focus time of each tab', async function () {
    const record = createFocusRecord(createStorageArea(), () => 1);
    record.touch(1, 100);
    record.touch(2, 200);
    record.touch(1, 300);
    const { focusedAt } = await record.all();
    expect(focusedAt).to.deep.equal({ 1: 300, 2: 200 });
  });

  it('should not go back to an earlier time', async function () {
    const record = createFocusRecord(createStorageArea(), () => 1);
    record.touch(1, 300);
    record.touch(1, 100);
    expect((await record.all()).focusedAt).to.deep.equal({ 1: 300 });
  });

  it('should forget a closed tab', async function () {
    const record = createFocusRecord(createStorageArea(), () => 1);
    record.touch(1, 100);
    record.touch(2, 200);
    record.forget(1);
    expect((await record.all()).focusedAt).to.deep.equal({ 2: 200 });
  });

  it('should keep the start time across a worker restart', async function () {
    const area = createStorageArea();
    await createFocusRecord(area, () => 1000).all();
    const restarted = createFocusRecord(area, () => 5000);
    expect((await restarted.all()).startedAt).to.equal(1000);
  });

  it('should keep going after a failed write', async function () {
    const area = createStorageArea();
    const record = createFocusRecord(area, () => 1);
    sinon.stub(console, 'error');
    const set = sinon.stub(area, 'set').callThrough();
    set.onSecondCall().rejects(new Error('quota'));
    await record.touch(1, 100).catch(() => {});
    record.touch(2, 200);
    expect((await record.all()).focusedAt).to.deep.equal({ 2: 200 });
  });

  it('should work without storage.session', async function () {
    const record = createFocusRecord(undefined, () => 1000);
    record.touch(1, 100);
    expect(await record.all()).to.deep.equal({ focusedAt: { 1: 100 }, startedAt: 1000 });
  });
});
