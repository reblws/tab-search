import sinon from 'sinon';
import { JSDOM } from 'jsdom';

describe('popup context menu', function () {
  let document;
  let tabList;
  let overrideResultContextMenu;
  let updateMenuTitles;
  let runMenuItem;

  // One document for the whole suite: constants.js keeps the nodes it found
  // when it was first imported
  before(async function () {
    const dom = new JSDOM(`<!DOCTYPE html><html><body>
      <input class="search"><div class="tab-list"></div>
    </body></html>`);
    document = dom.window.document;
    global.document = document;
    tabList = document.querySelector('.tab-list');
    ({
      overrideResultContextMenu,
      updateMenuTitles,
      runMenuItem,
    } = await import('./context-menu.js'));
  });

  after(function () {
    delete global.document;
  });

  beforeEach(function () {
    tabList.innerHTML = '';
    browser.menus = {
      overrideContext: sinon.stub(),
      update: sinon.stub().resolves(),
      refresh: sinon.stub().resolves(),
    };
  });

  function addRow(type, id) {
    const node = document.createElement('div');
    node.className = `tab-object ${type}`;
    node.setAttribute('tabindex', '0');
    node.dataset.type = type;
    node.dataset.id = id;
    node.innerHTML = '<span class="tab-title">title</span>';
    tabList.appendChild(node);
    return node;
  }

  const rightClick = target => overrideResultContextMenu({ target });
  const getState = () => ({ general: {} });

  describe('overrideResultContextMenu', function () {
    it('overrides with the tab context for tab and other-window rows', function () {
      rightClick(addRow('tab', '5').firstChild);
      rightClick(addRow('other-window-tab', '9'));
      expect(browser.menus.overrideContext.args).to.deep.equal([
        [{ context: 'tab', tabId: 5 }],
        [{ context: 'tab', tabId: 9 }],
      ]);
    });

    it('overrides with the bookmark context for bookmark rows', function () {
      rightClick(addRow('bookmark', 'abc123'));
      expect(browser.menus.overrideContext.calledOnceWith({
        context: 'bookmark',
        bookmarkId: 'abc123',
      })).to.equal(true);
    });

    it('leaves history and recently closed rows alone', function () {
      rightClick(addRow('history', '1'));
      rightClick(addRow('session', '2'));
      expect(browser.menus.overrideContext.called).to.equal(false);
    });

    it('does nothing when the target is outside a row', function () {
      rightClick(tabList);
      expect(browser.menus.overrideContext.called).to.equal(false);
    });

    it('does nothing when menus.overrideContext is missing (Chrome)', function () {
      delete browser.menus;
      expect(() => rightClick(addRow('tab', '5'))).to.not.throw();
    });
  });

  describe('updateMenuTitles', function () {
    it('names Pin and Mute after the next click', async function () {
      rightClick(addRow('tab', '5'));
      await updateMenuTitles(
        { contexts: ['tab'] },
        { pinned: true, mutedInfo: { muted: false } },
      );
      expect(browser.menus.update.args).to.deep.equal([
        ['tab-pin', { title: 'Unpin Tab' }],
        ['tab-mute', { title: 'Mute Tab' }],
      ]);
      expect(browser.menus.refresh.calledOnce).to.equal(true);
    });

    it('ignores menus that are not a result tab menu', async function () {
      rightClick(addRow('history', '1'));
      await updateMenuTitles({ contexts: ['tab'] }, { pinned: true, mutedInfo: { muted: true } });
      expect(browser.menus.update.called).to.equal(false);
    });
  });

  describe('runMenuItem', function () {
    it('runs the keyboard command of the clicked item on the menu row', async function () {
      const row = addRow('tab', '5');
      rightClick(row);
      browser.tabs.get.resolves({ pinned: false });
      browser.tabs.update.resolves({ pinned: true });
      runMenuItem({ menuItemId: 'tab-pin' }, getState);
      await new Promise(setImmediate);
      expect(document.activeElement).to.equal(row);
      expect(browser.tabs.update.calledOnceWith(5, { pinned: true })).to.equal(true);
      expect(row.classList.contains('pin')).to.equal(true);
    });

    it('toggles mute from the muted state, not the audible state', async function () {
      rightClick(addRow('tab', '5'));
      browser.tabs.get.resolves({ audible: true, mutedInfo: { muted: true } });
      browser.tabs.update.resolves({ mutedInfo: { muted: false } });
      runMenuItem({ menuItemId: 'tab-mute' }, getState);
      await new Promise(setImmediate);
      expect(browser.tabs.update.calledOnceWith(5, { muted: false })).to.equal(true);
    });

    it('ignores items from other add-ons', function () {
      rightClick(addRow('tab', '5'));
      runMenuItem({ menuItemId: 'other-addon-item' }, getState);
      expect(browser.tabs.get.called).to.equal(false);
    });
  });
});
