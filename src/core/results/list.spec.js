import { scrollDirection, closedRowPlan } from './list.js';

describe('scrollDirection', function () {
  it('should scroll down when the row ends below the list', function () {
    expect(scrollDirection({ parentHeight: 100, selectedTop: 80, selectedBottom: 120 })).to.equal('down');
  });

  it('should scroll up when the row starts above the list', function () {
    expect(scrollDirection({ parentHeight: 100, selectedTop: -5, selectedBottom: 20 })).to.equal('up');
  });

  it('should not scroll a row that is fully visible', function () {
    expect(scrollDirection({ parentHeight: 100, selectedTop: 0, selectedBottom: 100 })).to.equal(null);
  });
});

describe('closedRowPlan', function () {
  const show = { showRecentlyClosed: true, alwaysShowRecentlyClosedAtTheBottom: false };
  const bottom = { showRecentlyClosed: true, alwaysShowRecentlyClosedAtTheBottom: true };

  it('should remove the row when recently closed tabs are hidden', function () {
    expect(closedRowPlan(0, ['tab'], { showRecentlyClosed: false })).to.deep.equal({ remove: true });
  });

  it('should repaint the row in place', function () {
    expect(closedRowPlan(0, ['tab', 'tab'], show)).to.deep.equal({ repaint: true });
  });

  it('should move the row to the top of the closed rows at the bottom', function () {
    const types = ['tab', 'tab', 'tab', 'session', 'session'];
    expect(closedRowPlan(1, types, bottom)).to.deep.equal({ repaint: true, moveBefore: 3 });
  });

  it('should leave a row that already joins the closed rows where it is', function () {
    expect(closedRowPlan(1, ['tab', 'tab', 'session'], bottom)).to.deep.equal({ repaint: true, moveBefore: 1 });
    expect(closedRowPlan(2, ['tab', 'tab', 'tab'], bottom)).to.deep.equal({ repaint: true, moveBefore: 2 });
  });

  it('should only count closed rows at the very end', function () {
    const types = ['session', 'tab', 'tab', 'bookmark'];
    expect(closedRowPlan(1, types, bottom)).to.deep.equal({ repaint: true, moveBefore: null });
  });
});
