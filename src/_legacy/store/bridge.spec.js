import sinon from 'sinon';
import { createStore } from 'redux';
import { CONNECTION_NAME, DISPATCH, UPDATE_STATE } from './constants.js';
import { wrapBackgroundStore } from './bridge.js';

// Minimal chrome.runtime with the two listeners the bridge adds
function createChromeMock() {
  const listeners = { message: null, connect: null };
  return {
    listeners,
    runtime: {
      onMessage: { addListener: (fn) => { listeners.message = fn; } },
      onConnect: { addListener: (fn) => { listeners.connect = fn; } },
    },
  };
}

function deferred() {
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  return { promise, resolve };
}

const flush = () => new Promise(r => setTimeout(r, 0));

describe('wrapBackgroundStore', function () {
  let chromeMock;
  let store;
  let rehydration;

  beforeEach(function () {
    chromeMock = createChromeMock();
    global.chrome = chromeMock;
    store = createStore((state = { value: 'default' }, action) =>
      (action.type === 'SET' ? { value: action.value } : state));
    rehydration = deferred();
    wrapBackgroundStore({
      store,
      rehydrated: rehydration.promise,
      actions: { SET: act => Object.assign(act, { type: 'SET' }) },
    });
  });

  afterEach(function () {
    delete global.chrome;
  });

  it('should add its listeners synchronously', function () {
    expect(chromeMock.listeners.message).to.be.a('function');
    expect(chromeMock.listeners.connect).to.be.a('function');
  });

  it('should wait for rehydration before replying with the state', async function () {
    const reply = sinon.spy();
    const keepOpen = chromeMock.listeners.message({ type: UPDATE_STATE }, {}, reply);
    expect(keepOpen).to.equal(true);

    await flush();
    expect(reply.called).to.equal(false);

    store.dispatch({ type: 'SET', value: 'saved' });
    rehydration.resolve();
    await flush();
    expect(reply.calledOnceWith({ value: 'saved' })).to.equal(true);
  });

  it('should dispatch whitelisted actions after rehydration', async function () {
    chromeMock.listeners.message({ type: DISPATCH, action: { type: 'SET', value: 'new' } }, {}, () => {});
    await flush();
    expect(store.getState().value).to.equal('default');

    rehydration.resolve();
    await flush();
    expect(store.getState().value).to.equal('new');
  });

  it('should ignore actions that are not whitelisted', async function () {
    const consoleError = sinon.stub(console, 'error');
    chromeMock.listeners.message({ type: DISPATCH, action: { type: 'OTHER' } }, {}, () => {});
    rehydration.resolve();
    await flush();
    consoleError.restore();
    expect(store.getState().value).to.equal('default');
    expect(consoleError.calledOnce).to.equal(true);
  });

  it('should not keep the message channel open for dispatches', function () {
    const keepOpen = chromeMock.listeners.message({ type: DISPATCH, action: { type: 'SET', value: 'new' } }, {}, () => {});
    expect(keepOpen).to.not.equal(true);
  });

  it('should ignore inherited property names as action types', async function () {
    const consoleError = sinon.stub(console, 'error');
    chromeMock.listeners.message({ type: DISPATCH, action: { type: 'constructor' } }, {}, () => {});
    rehydration.resolve();
    await flush();
    consoleError.restore();
    expect(store.getState().value).to.equal('default');
    expect(consoleError.calledOnce).to.equal(true);
  });

  it('should ignore ports with another name', function () {
    const port = {
      name: 'other',
      postMessage: sinon.spy(),
      onDisconnect: { addListener: sinon.spy() },
    };
    chromeMock.listeners.connect(port);
    store.dispatch({ type: 'SET', value: 'changed' });
    expect(port.postMessage.called).to.equal(false);
    expect(port.onDisconnect.addListener.called).to.equal(false);
  });

  it('should post every state change to connected pages', function () {
    const port = {
      name: CONNECTION_NAME,
      postMessage: sinon.spy(),
      onDisconnect: { addListener: sinon.spy() },
    };
    chromeMock.listeners.connect(port);
    store.dispatch({ type: 'SET', value: 'changed' });
    expect(port.postMessage.calledOnceWith({ type: UPDATE_STATE, data: { value: 'changed' } })).to.equal(true);

    const unsubscribe = port.onDisconnect.addListener.firstCall.args[0];
    unsubscribe();
    store.dispatch({ type: 'SET', value: 'again' });
    expect(port.postMessage.calledOnce).to.equal(true);
  });
});
