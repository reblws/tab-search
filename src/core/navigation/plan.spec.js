import { planNavigation, SEARCH } from './plan.js';
import {
  TAB_DELETE,
  TAB_OPEN,
  TAB_NEXT,
  TAB_PREV,
  TAB_MOVE,
  TAB_REFRESH,
  TAB_PIN,
  URL_COPY,
  TAB_BOOKMARK,
  DUPLICATE_TAB_DELETE,
  MUTE_TOGGLE,
} from '../keyboard/constants.js';

describe('planNavigation', function () {
  const tab = (url = 'a', type = 'tab') => ({ type, url, lastAccessed: '1' });
  const three = [tab('a'), tab('b'), tab('c')];
  const view = (focused, items = three) => ({ items, focused, noResults: false });

  describe('TAB_NEXT', function () {
    it('should move from the search input to the first row', function () {
      expect(planNavigation(TAB_NEXT, view(-1))).to.deep.equal({ focus: 0 });
    });

    it('should move to the next row', function () {
      expect(planNavigation(TAB_NEXT, view(1))).to.deep.equal({ focus: 2 });
    });

    it('should wrap from the last row to the search input', function () {
      expect(planNavigation(TAB_NEXT, view(2))).to.deep.equal({ focus: SEARCH });
    });
  });

  describe('TAB_PREV', function () {
    it('should wrap from the search input to the last row', function () {
      expect(planNavigation(TAB_PREV, view(-1))).to.deep.equal({ focus: 2 });
    });

    it('should move to the previous row', function () {
      expect(planNavigation(TAB_PREV, view(2))).to.deep.equal({ focus: 1 });
    });

    it('should move from the first row to the search input', function () {
      expect(planNavigation(TAB_PREV, view(0))).to.deep.equal({ focus: SEARCH });
    });
  });

  describe('TAB_DELETE', function () {
    it('should close the focused open tab', function () {
      expect(planNavigation(TAB_DELETE, view(1))).to.deep.equal({ close: [1] });
      const items = [tab('a', 'other-window-tab')];
      expect(planNavigation(TAB_DELETE, view(0, items))).to.deep.equal({ close: [0] });
    });

    it('should do nothing while the search input has focus', function () {
      expect(planNavigation(TAB_DELETE, view(-1))).to.equal(null);
    });

    it('should not close recently closed, bookmark or history rows', function () {
      ['session', 'bookmark', 'history'].forEach((type) => {
        expect(planNavigation(TAB_DELETE, view(0, [tab('a', type)]))).to.equal(null);
      });
    });
  });

  describe('commands on one row', function () {
    it('should act on the first row while the search input has focus', function () {
      expect(planNavigation(TAB_OPEN, view(-1))).to.deep.equal({ open: 0 });
      expect(planNavigation(TAB_REFRESH, view(-1))).to.deep.equal({ reload: 0 });
    });

    it('should act on the focused row', function () {
      expect(planNavigation(TAB_OPEN, view(2))).to.deep.equal({ open: 2 });
      expect(planNavigation(TAB_REFRESH, view(2))).to.deep.equal({ reload: 2 });
      expect(planNavigation(TAB_PIN, view(2))).to.deep.equal({ pin: 2 });
      expect(planNavigation(MUTE_TOGGLE, view(2))).to.deep.equal({ mute: 2 });
      expect(planNavigation(URL_COPY, view(2))).to.deep.equal({ copyUrl: 2 });
    });

    it('should only reload, pin or mute open tabs', function () {
      const items = [tab('a', 'bookmark')];
      [TAB_REFRESH, TAB_PIN, MUTE_TOGGLE].forEach((cmd) => {
        expect(planNavigation(cmd, view(0, items))).to.equal(null);
      });
    });

    it('should open and copy the url of any row', function () {
      const items = [tab('a', 'history')];
      expect(planNavigation(TAB_OPEN, view(0, items))).to.deep.equal({ open: 0 });
      expect(planNavigation(URL_COPY, view(0, items))).to.deep.equal({ copyUrl: 0 });
    });
  });

  describe('DUPLICATE_TAB_DELETE', function () {
    it('should close the duplicate open tabs', function () {
      const items = [tab('a'), tab('b'), tab('a')];
      expect(planNavigation(DUPLICATE_TAB_DELETE, view(-1, items))).to.deep.equal({ close: [2] });
    });

    it('should do nothing without duplicates or results', function () {
      expect(planNavigation(DUPLICATE_TAB_DELETE, view(-1))).to.equal(null);
      const noResults = { items: [{}], focused: -1, noResults: true };
      expect(planNavigation(DUPLICATE_TAB_DELETE, noResults)).to.equal(null);
    });
  });

  it('should do nothing for an empty list', function () {
    [TAB_NEXT, TAB_PREV, TAB_OPEN, URL_COPY].forEach((cmd) => {
      expect(planNavigation(cmd, view(-1, []))).to.equal(null);
    });
  });

  it('should do nothing for commands without an action', function () {
    [TAB_MOVE, TAB_BOOKMARK, undefined].forEach((cmd) => {
      expect(planNavigation(cmd, view(0))).to.equal(null);
    });
  });
});
