import sinon from 'sinon';
import { withRemoteApi, needsRemoteApi } from './remote-api.js';
import { REMOTE_CALL } from 'core/overlay/remote.js';

function fakePort() {
  const listeners = { message: [], disconnect: [] };
  return {
    sent: [],
    postMessage(msg) { this.sent.push(msg); },
    onMessage: { addListener: l => listeners.message.push(l) },
    onDisconnect: { addListener: l => listeners.disconnect.push(l) },
    emit: msg => listeners.message.forEach(l => l(msg)),
  };
}

describe('withRemoteApi', function () {
  // What Firefox gives the overlay's frame: no tabs, a runtime without
  // getPlatformInfo
  const frameApi = () => ({
    runtime: { sendMessage: sinon.stub(), connect: sinon.stub(), getURL: p => `ext:/${p}` },
    storage: {},
  });

  it('should send the missing methods to the background', async function () {
    const send = sinon.stub().resolves({ result: [{ id: 1 }] });
    const api = withRemoteApi(frameApi(), { send });
    expect(await api.tabs.query({ currentWindow: true })).to.deep.equal([{ id: 1 }]);
    expect(send.calledOnceWith({ type: REMOTE_CALL, method: 'tabs.query', args: [{ currentWindow: true }] }))
      .to.equal(true);
  });

  it('should fill in single methods and keep the frame\'s own', async function () {
    const native = frameApi();
    const send = sinon.stub().resolves({ result: { os: 'linux' } });
    const api = withRemoteApi(native, { send });
    expect(await api.runtime.getPlatformInfo()).to.deep.equal({ os: 'linux' });
    expect(api.runtime.getURL('a')).to.equal('ext:/a');
    api.runtime.sendMessage({ x: 1 });
    expect(native.runtime.sendMessage.calledOnceWith({ x: 1 })).to.equal(true);
    expect(api.storage).to.equal(native.storage);
  });

  it('should reject with the background\'s error', async function () {
    const api = withRemoteApi(frameApi(), { send: sinon.stub().resolves({ error: 'No tab with id: 4' }) });
    let error;
    await api.tabs.update(4, {}).catch((e) => { error = e; });
    expect(error.message).to.equal('No tab with id: 4');
  });

  it('should pass on tab events over one port', function () {
    const port = fakePort();
    const connect = sinon.stub().returns(port);
    const api = withRemoteApi(frameApi(), { send: sinon.stub(), connect });
    const onCreated = sinon.spy();
    const onRemoved = sinon.spy();
    api.tabs.onCreated.addListener(onCreated);
    api.tabs.onRemoved.addListener(onRemoved);
    expect(connect.calledOnce).to.equal(true);
    expect(port.sent).to.deep.equal([{ subscribe: 'tabs.onCreated' }, { subscribe: 'tabs.onRemoved' }]);
    port.emit({ event: 'tabs.onRemoved', args: [5, { windowId: 1 }] });
    expect(onRemoved.calledOnceWith(5, { windowId: 1 })).to.equal(true);
    expect(onCreated.called).to.equal(false);
    expect(api.tabs.onRemoved.hasListener(onRemoved)).to.equal(true);
    api.tabs.onRemoved.removeListener(onRemoved);
    expect(port.sent[2]).to.deep.equal({ unsubscribe: 'tabs.onRemoved' });
    port.emit({ event: 'tabs.onRemoved', args: [6] });
    expect(onRemoved.calledOnce).to.equal(true);
  });

  it('should leave a full API as it is', function () {
    const full = { tabs: { query() {}, get() {}, update() {}, reload() {}, remove() {}, create() {} } };
    Object.assign(full, {
      windows: { getCurrent() {}, get() {}, update() {} },
      sessions: { getRecentlyClosed() {}, restore() {} },
      bookmarks: { search() {} },
      history: { search() {} },
      commands: { getAll() {} },
      runtime: { getPlatformInfo() {} },
    });
    ['onCreated', 'onRemoved', 'onUpdated'].forEach((name) => { full.tabs[name] = {}; });
    expect(withRemoteApi(full)).to.equal(full);
  });

  it('should tell when the frame lacks the tabs API', function () {
    expect(needsRemoteApi(frameApi())).to.equal(true);
    expect(needsRemoteApi({ tabs: { query() {} } })).to.equal(false);
  });
});
