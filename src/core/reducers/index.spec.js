import { createStore } from 'redux';
import { persistStore } from 'redux-persist';
import { createRootReducer } from './index.js';
import { LAST_QUERY_UPDATE } from '../actions/types.js';

// In-memory browser.storage area
function createStorageArea() {
  const items = {};
  return {
    items,
    get: key => Promise.resolve(key in items ? { [key]: items[key] } : {}),
    set: obj => Promise.resolve(Object.assign(items, obj)),
    remove: (key) => {
      delete items[key];
      return Promise.resolve();
    },
  };
}

function startStore(areas) {
  const store = createStore(createRootReducer(areas));
  return new Promise((resolve) => {
    persistStore(store, null, () => resolve(store));
  });
}

const flush = () => new Promise(r => setTimeout(r, 20));
const updateLastQuery = key => ({ type: LAST_QUERY_UPDATE, payload: { key } });

describe('root reducer persistence', function () {
  it('should keep the last query in session storage across restarts', async function () {
    const local = createStorageArea();
    const session = createStorageArea();
    const store = await startStore({ local, session });
    store.dispatch(updateLastQuery('fixture'));
    await flush();
    expect(Object.keys(session.items)).to.deep.equal(['persist:state']);
    // Never in storage.local, which outlives the browser session
    expect(JSON.parse(local.items['persist:root'])).to.not.have.property('state');

    // A restarted service worker starts with a fresh store
    const restarted = await startStore({ local, session });
    expect(restarted.getState().state.lastQuery).to.equal('fixture');
  });

  it('should keep the last query in memory only without session storage', async function () {
    const local = createStorageArea();
    const store = await startStore({ local });
    store.dispatch(updateLastQuery('fixture'));
    await flush();
    expect(store.getState().state.lastQuery).to.equal('fixture');
    expect(JSON.parse(local.items['persist:root'])).to.not.have.property('state');

    const restarted = await startStore({ local });
    expect(restarted.getState().state.lastQuery).to.equal('');
  });
});
