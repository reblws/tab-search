/**
 * Helper utilities for WebdriverIO E2E tests with the TabSearch extension.
 */
import { EXTENSION_UUID } from '../../../wdio.conf.js';

/**
 * Get the extension's internal UUID from Firefox.
 * wdio.conf.js pins it via the extensions.webextensions.uuids pref, so it is
 * known before the add-on is installed (moz-extension://UUID/...).
 *
 * @returns {Promise<string>} The extension UUID
 */
export async function getExtensionId() {
  return EXTENSION_UUID;
}

/**
 * Navigate to the extension's popup page.
 */
export async function openPopup() {
  const extensionId = await getExtensionId();
  await browser.url(`moz-extension://${extensionId}/popup/index.html`);
}

/**
 * Navigate to the extension's settings page.
 */
export async function openSettings() {
  const extensionId = await getExtensionId();
  await browser.url(`moz-extension://${extensionId}/settings/index.html`);
}
