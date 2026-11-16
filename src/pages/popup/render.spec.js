import { JSDOM } from 'jsdom';
import sinon from 'sinon';
import { initialColorSettings, initialGeneralSettings } from 'core/reducers/defaults';
import { tabToTag, repaintElementWithType } from './render';

describe('result row state changes', function () {
  const getState = () => ({ color: initialColorSettings, general: initialGeneralSettings });

  beforeEach(function () {
    global.document = new JSDOM('<!doctype html><div class="tab-list"></div>').window.document;
  });

  afterEach(function () {
    delete global.document;
  });

  it('keeps the page title separate from current-tab and type labels', function () {
    const row = tabToTag(getState)({
      id: 7, type: 'tab', title: 'Project notes', url: 'https://notes.test',
      active: true, favIconUrl: 'https://notes.test/favicon.png',
    });
    expect(row.querySelector('.tab-title').textContent).to.equal('Project notes');
    expect(row.querySelector('.tab-current').textContent).to.equal('Current');
    expect(row.querySelector('.tab-type-label').textContent).to.equal('This window');
    expect(row.querySelector('.tab-img img').getAttribute('alt')).to.equal('');
  });

  it('updates the type explanation and clears live-tab states after closing', function () {
    const row = tabToTag(getState)({
      id: 7, type: 'tab', title: 'Project notes', url: 'https://notes.test',
      active: true, pinned: true, audible: true, mutedInfo: { muted: true },
    });
    repaintElementWithType(row, 'session');
    expect(row.dataset.type).to.equal('session');
    expect(row.classList.contains('session')).to.equal(true);
    expect(row.querySelector('.tab-type-label').textContent).to.equal('Recently closed');
    expect(row.querySelector('.tab-current')).to.equal(null);
    expect(row.querySelector('.tab-object__delete-button')).to.equal(null);
    expect(['pin', 'audible', 'mute'].some(name => row.classList.contains(name))).to.equal(false);
    expect(row.id).to.equal('');
  });

  it('opens only on pointer interest and stays open while crossing to the label', function () {
    const clock = sinon.useFakeTimers();
    try {
      const row = tabToTag(getState)({ id: 9, type: 'tab', title: 'Notes', url: 'https://notes.test' });
      document.querySelector('.tab-list').append(row);
      const badge = row.querySelector('.tab-type-badge');
      const label = row.querySelector('.tab-type-label');
      const pointer = (node, type) => node.dispatchEvent(new document.defaultView.Event(type));
      row.focus();
      expect(badge.classList.contains('is-type-hovered')).to.equal(false);
      pointer(badge, 'pointerenter');
      pointer(badge, 'pointerleave');
      clock.tick(100);
      pointer(label, 'pointerenter');
      clock.tick(200);
      expect(badge.classList.contains('is-type-hovered')).to.equal(true);
      pointer(label, 'pointerleave');
      clock.tick(150);
      expect(badge.classList.contains('is-type-hovered')).to.equal(false);
    } finally {
      clock.restore();
    }
  });
});
