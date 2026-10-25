// MV3 (Chrome) has browser.action; MV2 (Firefox) has browser.browserAction
const api = browser.action || browser.browserAction;

export const POPUP_COMMAND = browser.action ? '_execute_action' : '_execute_browser_action';
export const setBadgeText = details => api.setBadgeText(details);
export const setBadgeBackgroundColor = details => api.setBadgeBackgroundColor(details);
