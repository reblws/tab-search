// Where the popup page is running, read from its query string, and what that
// means for it:
//   popup    the toolbar popup
//   preview  the settings page's live preview, in a frame
//   overlay  the overlay over a web page, in a frame the host script made
//   window   the popup window the background opens when the overlay can't
//            show and the toolbar popup can't open either
export const POPUP = 'popup';
export const PREVIEW = 'preview';
export const OVERLAY = 'overlay';
export const WINDOW = 'window';

// focus:     'workaround' to focus the search input after load, or 'none'
// close:     'window' (window.close()), 'host' (ask the host script) or 'none'
// tabMenu:   whether right-clicking a result can open Firefox's tab menu;
//            the overlay's frame has no menus.overrideContext
// backdrop:  whether a click outside the panel closes the page
// escape:    whether Escape closes the page. The browser already closes the
//            toolbar popup on Escape; a popup page opened in a tab stays.
// closeOnBlur: whether the page closes when its window loses focus. The
//            browser does it for the toolbar popup. The overlay doesn't: its
//            frame covers the page, so a blur there is a page script taking
//            the focus, not the user leaving.
const TRAITS = {
  [POPUP]: {
    focus: 'workaround', close: 'window', tabMenu: true, backdrop: false, escape: false, closeOnBlur: false,
  },
  [PREVIEW]: {
    focus: 'none', close: 'none', tabMenu: false, backdrop: false, escape: false, closeOnBlur: false,
  },
  [OVERLAY]: {
    focus: 'workaround', close: 'host', tabMenu: false, backdrop: true, escape: true, closeOnBlur: false,
  },
  [WINDOW]: {
    focus: 'workaround', close: 'window', tabMenu: false, backdrop: false, escape: true, closeOnBlur: true,
  },
};

// query: a plain object of the page's query parameters
export function surfaceOf(query = {}) {
  // ?preview predates ?surface; the settings page still sends it
  const name = Object.prototype.hasOwnProperty.call(query, 'preview') ? PREVIEW : query.surface;
  const surface = Object.prototype.hasOwnProperty.call(TRAITS, name) ? name : POPUP;
  const from = parseInt(query.from, 10);
  const fromWindowId = surface === WINDOW && Number.isInteger(from) ? from : undefined;
  return Object.assign({ surface, fromWindowId }, TRAITS[surface]);
}
