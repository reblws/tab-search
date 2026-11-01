import sinon from 'sinon';
import { handleRemoteCall } from './remote-api.js';
import { REMOTE_CALL } from 'core/overlay/remote.js';

describe('background remote API', function () {
  const frame = { id: 'ext', url: 'moz-extension://ext/popup/index.html?surface=overlay', tab: { id: 3, windowId: 8 } };

  beforeEach(function () {
    browser.runtime.id = 'ext';
    browser.runtime.getURL = path => `moz-extension://ext/${path}`;
    browser.windows.get = sinon.stub().resolves({ id: 8 });
  });

  const call = (method, args, sender = frame) => handleRemoteCall({ type: REMOTE_CALL, method, args }, sender);

  it('should make the overlay frame\'s calls', async function () {
    browser.tabs.update.resolves({ id: 4, active: true });
    expect(await call('tabs.update', [4, { active: true }])).to.deep.equal({ result: { id: 4, active: true } });
    expect(browser.tabs.update.calledOnceWith(4, { active: true })).to.equal(true);
  });

  it('should answer for the overlay tab\'s window', async function () {
    await call('windows.getCurrent', []);
    expect(browser.windows.get.calledOnceWith(8)).to.equal(true);
    await call('tabs.query', [{ currentWindow: true }]);
    expect(browser.tabs.query.calledOnceWith({ windowId: 8 })).to.equal(true);
  });

  it('should refuse anyone but the overlay frame', async function () {
    const others = [
      Object.assign({}, frame, { id: 'other-extension' }),
      Object.assign({}, frame, { url: 'https://evil.example/' }),
      Object.assign({}, frame, { url: 'moz-extension://ext/settings/index.html' }),
      Object.assign({}, frame, { tab: undefined }),
      null,
    ];
    for (const sender of others) {
      expect(await call('tabs.remove', [3], sender)).to.have.property('error');
    }
    expect(browser.tabs.remove.called).to.equal(false);
  });

  it('should refuse methods outside the list', async function () {
    browser.tabs.executeScript = sinon.stub();
    expect(await call('tabs.executeScript', [3, { code: 'x' }])).to.have.property('error');
    expect(browser.tabs.executeScript.called).to.equal(false);
  });

  it('should pass on the API\'s errors', async function () {
    browser.tabs.get.rejects(new Error('Invalid tab ID: 9'));
    expect(await call('tabs.get', [9])).to.deep.equal({ error: 'Invalid tab ID: 9' });
  });
});
