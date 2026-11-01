import { activeSection, revealScrollLeft, previewFit } from './layout.js';

describe('settings layout', function () {
  describe('activeSection', function () {
    const sections = [{ top: -400 }, { top: -50 }, { top: 300 }, { top: 900 }];

    it('should pick the last section scrolled past the line', function () {
      expect(activeSection(sections, { line: 100, atBottom: false })).to.equal(1);
    });

    it('should pick the last section at the bottom of the page', function () {
      expect(activeSection(sections, { line: 100, atBottom: true })).to.equal(3);
    });

    it('should skip hidden and missing sections', function () {
      const some = [{ top: -400 }, null, { top: -10, hidden: true }, { top: 900 }];
      expect(activeSection(some, { line: 100, atBottom: false })).to.equal(0);
    });
  });

  describe('revealScrollLeft', function () {
    const nav = { scrollLeft: 100, clientWidth: 200 };

    it('should scroll back to a link cut off on the left', function () {
      expect(revealScrollLeft({ start: 50, end: 120 }, nav)).to.equal(50);
    });

    it('should scroll on to a link cut off on the right', function () {
      expect(revealScrollLeft({ start: 250, end: 340 }, nav)).to.equal(140);
    });

    it('should leave a visible link alone', function () {
      expect(revealScrollLeft({ start: 120, end: 300 }, nav)).to.equal(null);
    });
  });

  describe('previewFit', function () {
    it('should show a popup that fits at full size', function () {
      expect(previewFit({ room: 500, width: 400 })).to.deep.equal({ scale: 1, label: '400 px wide' });
    });

    it('should shrink a popup wider than the room', function () {
      expect(previewFit({ room: 300, width: 400, popupWidth: 398 }))
        .to.deep.equal({ scale: 0.75, label: '398 px wide, shown at 75%' });
    });

    it('should not scale without a size to scale by', function () {
      expect(previewFit({ room: 0, width: 400 }).scale).to.equal(1);
      expect(previewFit({ room: 300, width: 0 }).scale).to.equal(1);
    });
  });
});
