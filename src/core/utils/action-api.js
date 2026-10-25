// MV3 (Chrome) has browser.action; MV2 (Firefox) has browser.browserAction
const api = browser.action || browser.browserAction;
const isMv3 = browser.runtime.getManifest().manifest_version === 3;

// Must match the command name in the manifest, which depends on its version
export const POPUP_COMMAND = isMv3 ? '_execute_action' : '_execute_browser_action';
export const setBadgeText = details => api.setBadgeText(details);
export const setBadgeBackgroundColor = details => api.setBadgeBackgroundColor(details);
