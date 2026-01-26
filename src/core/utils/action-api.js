// Compatibility wrapper for browser.action (MV3) vs browser.browserAction (MV2)
const actionApi = browser.action || browser.browserAction;

export const setBadgeText = actionApi.setBadgeText.bind(actionApi);
export const setBadgeBackgroundColor = actionApi.setBadgeBackgroundColor.bind(actionApi);
