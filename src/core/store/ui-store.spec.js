import sinon from 'sinon';
import { CONNECTION_NAME, DISPATCH, UPDATE_STATE } from './constants.js';
import { createUIStore } from './ui-store.js';

function createPort(name) {
  const listeners = { message: [], disconnect: [] };
  return {
    name,
    onMessage: { addListener: (fn) => { listeners.message.push(fn); } },
    onDisconnect: { addListener: (fn) => { listeners.disconnect.push(fn); } },
    // What the background does
    push: (data) => listeners.message.forEach(fn => fn({ type: UPDATE_STATE, data })),
    // What Chrome does when the service worker stops
    disconnect: () => listeners.disconnect.forEach(fn => fn()),
  };
}

// chrome.runtime with a fake background that answers UPDATE_STATE with
// backgroundState. log records connects and messages in the order sent.
function createChromeMock() {
  const mock = {
    backgroundState: { value: 'saved' },
    ports: [],
    log: [],
    runtime: {
      lastError: undefined,
      connect: ({ name }) => {
        const port = createPort(name);
        mock.ports.push(port);
        mock.log.push('connect');
        return port;
      },
      sendMessage: (msg, reply) => {
        mock.log.push(msg.type);
        const response = msg.type === UPDATE_STATE ? mock.backgroundState : undefined;
        setTimeout(() => reply && reply(response), 0);
      },
    },
  };
  return mock;
}

const flush = () => new Promise(r => setTimeout(r, 5));
// Node's Event, captured before other specs replace or delete global.Event
const NodeEvent = global.Event;

describe('createUIStore', function () {
  let chromeMock;

  beforeEach(function () {
    chromeMock = createChromeMock();
    global.chrome = chromeMock;
    global.window = new EventTarget();
    global.document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  });

  afterEach(async function () {
    // Let pending replies run before chrome goes away
    await flush();
    delete global.chrome;
    delete global.window;
    delete global.document;
  });

  it('should connect and resolve with the background state', async function () {
    const store = await createUIStore();
    expect(chromeMock.ports).to.have.length(1);
    expect(chromeMock.ports[0].name).to.equal(CONNECTION_NAME);
    expect(store.getState()).to.deep.equal({ value: 'saved' });
  });

  it('should notify subscribers of state pushed by the background', async function () {
    const store = await createUIStore();
    const listener = sinon.spy();
    const unsubscribe = store.subscribe(listener);
    chromeMock.ports[0].push({ value: 'pushed' });
    expect(listener.calledOnce).to.equal(true);
    expect(store.getState()).to.deep.equal({ value: 'pushed' });

    unsubscribe();
    chromeMock.ports[0].push({ value: 'again' });
    expect(listener.calledOnce).to.equal(true);
  });

  it('should send dispatches over the existing connection', async function () {
    const store = await createUIStore();
    chromeMock.log = [];
    store.dispatch({ type: 'SET', value: 'new' });
    await flush();
    expect(chromeMock.log).to.deep.equal([DISPATCH]);
    expect(chromeMock.ports).to.have.length(1);
  });

  it('should not reconnect by itself when the background disconnects', async function () {
    await createUIStore();
    chromeMock.log = [];
    chromeMock.ports[0].disconnect();
    await flush();
    expect(chromeMock.log).to.deep.equal([]);
  });

  it('should reconnect before dispatching after a disconnect, then refresh', async function () {
    const store = await createUIStore();
    const listener = sinon.spy();
    store.subscribe(listener);
    chromeMock.ports[0].disconnect();
    chromeMock.log = [];

    // A restarted service worker has the new state but no connected pages
    chromeMock.backgroundState = { value: 'new' };
    store.dispatch({ type: 'SET', value: 'new' });
    expect(chromeMock.log).to.deep.equal(['connect', DISPATCH, UPDATE_STATE]);
    await flush();
    expect(store.getState()).to.deep.equal({ value: 'new' });
    expect(listener.called).to.equal(true);

    // Later changes arrive over the new connection
    chromeMock.ports[1].push({ value: 'pushed' });
    expect(store.getState()).to.deep.equal({ value: 'pushed' });
  });

  it('should ignore a disconnect of an old connection', async function () {
    const store = await createUIStore();
    chromeMock.ports[0].disconnect();
    store.dispatch({ type: 'SET', value: 'new' });
    chromeMock.ports[0].disconnect();
    chromeMock.log = [];
    store.dispatch({ type: 'SET', value: 'again' });
    expect(chromeMock.log).to.deep.equal([DISPATCH]);
  });

  it('should catch up when the page regains focus after a disconnect', async function () {
    const store = await createUIStore();
    chromeMock.log = [];
    // Connected: focusing the page costs nothing
    window.dispatchEvent(new NodeEvent('focus'));
    expect(chromeMock.log).to.deep.equal([]);

    // Another page changed a setting while this page was disconnected
    chromeMock.ports[0].disconnect();
    chromeMock.backgroundState = { value: 'changed elsewhere' };
    window.dispatchEvent(new NodeEvent('focus'));
    expect(chromeMock.log).to.deep.equal(['connect', UPDATE_STATE]);
    await flush();
    expect(store.getState()).to.deep.equal({ value: 'changed elsewhere' });
  });

  it('should catch up when the page becomes visible after a disconnect', async function () {
    const store = await createUIStore();
    chromeMock.ports[0].disconnect();
    chromeMock.backgroundState = { value: 'changed elsewhere' };
    chromeMock.log = [];

    document.visibilityState = 'hidden';
    document.dispatchEvent(new NodeEvent('visibilitychange'));
    expect(chromeMock.log).to.deep.equal([]);

    document.visibilityState = 'visible';
    document.dispatchEvent(new NodeEvent('visibilitychange'));
    expect(chromeMock.log).to.deep.equal(['connect', UPDATE_STATE]);
    await flush();
    expect(store.getState()).to.deep.equal({ value: 'changed elsewhere' });
  });
});
