// MV3 (Chrome) has browser.action; MV2 (Firefox) has browser.browserAction
const api = () => browser.action || browser.browserAction;
const isMv3 = browser.runtime.getManifest().manifest_version === 3;

// The Chrome build is MV3 and the Firefox build MV2
export const browserName = isMv3 ? 'chrome' : 'firefox';

// Must match the command name in the manifest, which depends on its version
export const POPUP_COMMAND = isMv3 ? '_execute_action' : '_execute_browser_action';
export const setBadgeText = details => api().setBadgeText(details);
export const setBadgeBackgroundColor = details => api().setBadgeBackgroundColor(details);

// '' makes a click on the button (and its shortcut) fire onClicked instead
// of opening the popup
export const setPopup = popup => api().setPopup({ popup });

// Rejects where the browser won't open it: Chrome before 127, and Firefox
// before 149 once the click's user action has been used up
export function openPopup() {
  try {
    return Promise.resolve(api().openPopup());
  } catch (e) {
    return Promise.reject(e);
  }
}

export const addClickListener = listener => api().onClicked.addListener(listener);
