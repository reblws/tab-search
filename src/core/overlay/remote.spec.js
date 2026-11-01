import { planRemoteCall, isRemoteMethod, isRemoteEvent } from './remote.js';

describe('remote API plan', function () {
  const senderTab = { id: 9, windowId: 3 };

  it('should allow only the listed methods and events', function () {
    expect(isRemoteMethod('tabs.update')).to.equal(true);
    expect(isRemoteMethod('tabs.executeScript')).to.equal(false);
    expect(isRemoteMethod('management.uninstallSelf')).to.equal(false);
    expect(isRemoteMethod('tabs.query.x')).to.equal(false);
    expect(isRemoteMethod('constructor.name')).to.equal(false);
    expect(isRemoteEvent('tabs.onUpdated')).to.equal(true);
    expect(isRemoteEvent('tabs.onActivated')).to.equal(false);
  });

  it('should refuse anything else', function () {
    expect(planRemoteCall({ method: 'tabs.executeScript', args: [] }, senderTab))
      .to.have.property('error');
    expect(planRemoteCall(undefined, senderTab)).to.have.property('error');
  });

  it('should pass allowed calls through', function () {
    expect(planRemoteCall({ method: 'tabs.update', args: [4, { active: true }] }, senderTab))
      .to.deep.equal({ call: ['tabs', 'update'], args: [4, { active: true }] });
    expect(planRemoteCall({ method: 'sessions.getRecentlyClosed' }, senderTab))
      .to.deep.equal({ call: ['sessions', 'getRecentlyClosed'], args: [] });
  });

  it('should make the current window the overlay tab\'s window', function () {
    expect(planRemoteCall({ method: 'windows.getCurrent', args: [] }, senderTab))
      .to.deep.equal({ call: ['windows', 'get'], args: [3] });
    expect(planRemoteCall({ method: 'tabs.query', args: [{ currentWindow: true, pinned: false }] }, senderTab))
      .to.deep.equal({ call: ['tabs', 'query'], args: [{ pinned: false, windowId: 3 }] });
  });

  it('should leave queries across windows alone', function () {
    expect(planRemoteCall({ method: 'tabs.query', args: [{}] }, senderTab))
      .to.deep.equal({ call: ['tabs', 'query'], args: [{}] });
  });
});
