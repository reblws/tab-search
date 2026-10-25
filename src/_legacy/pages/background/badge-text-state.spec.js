import sinon from 'sinon';
import { createStore } from 'redux';
import { createSessionFlag, watchBadgeTextSetting } from './badge-text-state.js';

const DEFAULT_COLOR = '#default';

function reducer(state = {
  general: { showTabCountBadgeText: true },
  color: { popupBadgeColor: DEFAULT_COLOR },
  state: { lastQuery: '' },
}, action) {
  switch (action.type) {
    case 'BADGE': return { ...state, general: { showTabCountBadgeText: action.value } };
    case 'COLOR': return { ...state, color: { popupBadgeColor: action.value } };
    case 'QUERY': return { ...state, state: { lastQuery: action.value } };
    default: return state;
  }
}

function createStorageArea() {
  const items = {};
  return {
    items,
    get: key => Promise.resolve(key in items ? { [key]: items[key] } : {}),
    set: obj => Promise.resolve(Object.assign(items, obj)),
  };
}

const flush = () => new Promise(r => setTimeout(r, 0));

describe('watchBadgeTextSetting', function () {
  let store;
  let deps;

  // actions: dispatched before watching, like the state a worker rehydrates
  function watch(counted = false, ...actions) {
    store = createStore(reducer);
    actions.forEach(a => store.dispatch(a));
    deps = {
      store,
      rehydrated: Promise.resolve(),
      countedThisSession: {
        get: sinon.stub().resolves(counted),
        set: sinon.stub().resolves(),
      },
      startCounting: sinon.spy(),
      stopCounting: sinon.spy(),
      setBadgeBackgroundColor: sinon.spy(),
      defaultColor: DEFAULT_COLOR,
    };
    return watchBadgeTextSetting(deps);
  }

  it('should count once per browser session', async function () {
    await watch(false);
    expect(deps.startCounting.calledOnce).to.equal(true);
    expect(deps.countedThisSession.set.calledWith(true)).to.equal(true);
  });

  it('should not recount when a restarted worker wakes', async function () {
    await watch(true);
    expect(deps.startCounting.called).to.equal(false);
    expect(deps.stopCounting.called).to.equal(false);
  });

  it('should not count on startup when the badge is off', async function () {
    await watch(false, { type: 'BADGE', value: false });
    expect(deps.startCounting.called).to.equal(false);
    expect(deps.stopCounting.called).to.equal(false);
  });

  it('should ignore state changes that are not the badge setting', async function () {
    await watch(true);
    store.dispatch({ type: 'QUERY', value: 'a' });
    store.dispatch({ type: 'QUERY', value: 'ab' });
    expect(deps.startCounting.called).to.equal(false);
    expect(deps.stopCounting.called).to.equal(false);
  });

  it('should start and stop counting when the setting changes', async function () {
    await watch(true);
    store.dispatch({ type: 'BADGE', value: false });
    expect(deps.stopCounting.calledOnce).to.equal(true);
    expect(deps.countedThisSession.set.calledWith(false)).to.equal(true);
    store.dispatch({ type: 'BADGE', value: true });
    expect(deps.startCounting.calledOnce).to.equal(true);
    expect(deps.countedThisSession.set.lastCall.args).to.deep.equal([true]);
  });

  it('should apply a saved badge color on startup and on change', async function () {
    await watch(true, { type: 'COLOR', value: '#saved' });
    expect(deps.setBadgeBackgroundColor.calledOnceWith({ color: '#saved' })).to.equal(true);

    store.dispatch({ type: 'COLOR', value: '#new' });
    expect(deps.setBadgeBackgroundColor.lastCall.args).to.deep.equal([{ color: '#new' }]);
  });

  it('should leave the default badge color alone on startup', async function () {
    await watch(true);
    expect(deps.setBadgeBackgroundColor.called).to.equal(false);
  });
});

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
