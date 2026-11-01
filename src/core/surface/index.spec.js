import { surfaceOf, POPUP, PREVIEW, OVERLAY, WINDOW } from './index.js';

describe('surfaceOf', function () {
  it('should be the toolbar popup without a query', function () {
    expect(surfaceOf({})).to.include({
      surface: POPUP, close: 'window', tabMenu: true, escape: false,
    });
    expect(surfaceOf()).to.include({ surface: POPUP });
  });

  it('should read the settings page preview from ?preview', function () {
    expect(surfaceOf({ preview: '' })).to.include({ surface: PREVIEW, focus: 'none', close: 'none' });
  });

  it('should read the overlay, which closes through the host and its backdrop', function () {
    expect(surfaceOf({ surface: 'overlay' })).to.include({
      surface: OVERLAY, close: 'host', backdrop: true, escape: true, closeOnBlur: false, tabMenu: false,
    });
  });

  it('should read the fallback window and the window it came from', function () {
    expect(surfaceOf({ surface: 'window', from: '42' }))
      .to.include({ surface: WINDOW, fromWindowId: 42, close: 'window', closeOnBlur: true });
    expect(surfaceOf({ surface: 'window', from: 'x' }).fromWindowId).to.equal(undefined);
  });

  it('should ignore a window id on other surfaces', function () {
    expect(surfaceOf({ surface: 'overlay', from: '42' }).fromWindowId).to.equal(undefined);
  });

  it('should treat an unknown surface as the popup', function () {
    expect(surfaceOf({ surface: 'constructor' }).surface).to.equal(POPUP);
    expect(surfaceOf({ surface: 'nope' }).surface).to.equal(POPUP);
  });
});
