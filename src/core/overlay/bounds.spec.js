import { centeredBounds, WINDOW_SIZE } from './bounds.js';

describe('centeredBounds', function () {
  it('should center the window horizontally and a third of the way down', function () {
    expect(centeredBounds({ left: 100, top: 50, width: 1600, height: 1000 }, { width: 600, height: 400 }))
      .to.deep.equal({ left: 600, top: 250, width: 600, height: 400 });
  });

  it('should never be larger than the window it opens from', function () {
    expect(centeredBounds({ left: 0, top: 0, width: 500, height: 300 }, { width: 600, height: 400 }))
      .to.deep.equal({ left: 0, top: 0, width: 500, height: 300 });
  });

  it('should leave the position to the browser without a full parent window', function () {
    expect(centeredBounds({ width: 1200 })).to.deep.equal(WINDOW_SIZE);
    expect(centeredBounds(undefined)).to.deep.equal(WINDOW_SIZE);
  });
});
