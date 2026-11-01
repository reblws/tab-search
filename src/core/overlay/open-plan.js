// Whether a click on the toolbar button (or its shortcut) can show the
// overlay on a tab, or has to fall back to the toolbar popup.
//
// Browsers keep extensions out of their own pages, so the list below spares
// the user a failed injection on the pages they use most, like the new tab
// page. It needn't be complete: when an injection fails anyway, the
// background falls back the same way.

const RESTRICTED = {
  chrome: {
    schemes: ['chrome:', 'chrome-extension:', 'chrome-untrusted:', 'chrome-search:',
      'devtools:', 'edge:', 'view-source:', 'about:', 'data:', 'blob:', 'filesystem:'],
    // hostname + pathname prefixes
    prefixes: ['chromewebstore.google.com/', 'chrome.google.com/webstore'],
  },
  firefox: {
    schemes: ['about:', 'moz-extension:', 'view-source:', 'resource:', 'chrome:',
      'jar:', 'data:', 'blob:'],
    // The default extensions.webextensions.restrictedDomains
    prefixes: [
      'accounts-static.cdn.mozilla.net/', 'accounts.firefox.com/', 'addons.cdn.mozilla.net/',
      'addons.mozilla.org/', 'api.accounts.firefox.com/', 'content.cdn.mozilla.net/',
      'discovery.addons.mozilla.org/', 'install.mozilla.org/', 'oauth.accounts.firefox.com/',
      'profile.accounts.firefox.com/', 'support.mozilla.org/', 'sync.services.mozilla.com/',
    ],
  },
};

export const INJECT = 'inject';
export const POPUP = 'popup';

// tab: { id, url } as the click event gives it (url needs the tabs
// permission); browserName: 'chrome' | 'firefox'
// Returns { open: 'inject' } or { open: 'popup', reason }
export function planOpen(tab, browserName) {
  if (!tab || typeof tab.id !== 'number' || tab.id < 0) return { open: POPUP, reason: 'no-tab' };
  const rules = RESTRICTED[browserName] || RESTRICTED.chrome;
  let url;
  try {
    url = new URL(tab.url);
  } catch {
    return { open: POPUP, reason: 'no-url' };
  }
  if (rules.schemes.includes(url.protocol)) return { open: POPUP, reason: 'scheme' };
  const where = url.hostname + url.pathname;
  if (rules.prefixes.some(prefix => where.startsWith(prefix))) {
    return { open: POPUP, reason: 'host' };
  }
  return { open: INJECT };
}
