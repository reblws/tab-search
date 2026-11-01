import { clickIntent } from './click.js';

describe('clickIntent', function () {
  const click = (type, extra = {}) => clickIntent(Object.assign({ type, ctrlKey: false, onDeleteButton: false }, extra));

  it('should open each kind of row its own way', function () {
    expect(click('tab')).to.equal('switch');
    expect(click('other-window-tab')).to.equal('switch');
    expect(click('session')).to.equal('restore');
    expect(click('bookmark')).to.equal('openBookmark');
    expect(click('history')).to.equal('openHistory');
  });

  it('should close the tab from its delete button', function () {
    expect(click('tab', { onDeleteButton: true })).to.equal('close');
  });

  it('should close open tabs on Ctrl+click', function () {
    expect(click('tab', { ctrlKey: true })).to.equal('close');
    expect(click('other-window-tab', { ctrlKey: true })).to.equal('close');
  });

  it('should ignore Ctrl+click on other rows', function () {
    ['session', 'bookmark', 'history'].forEach((type) => {
      expect(click(type, { ctrlKey: true })).to.equal(null);
    });
  });

  it('should ignore rows of an unknown type', function () {
    expect(click(undefined)).to.equal(null);
  });
});
