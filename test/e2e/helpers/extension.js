/**
 * Helper utilities for WebdriverIO E2E tests with the TabSearch extension.
 */

let cachedExtensionId = null;

/**
 * Get the extension's internal UUID from Firefox.
 * The UUID is assigned when the extension is installed and is needed
 * to navigate to extension pages (moz-extension://UUID/...).
 *
 * @returns {Promise<string>} The extension UUID
 */
export async function getExtensionId() {
  if (cachedExtensionId) {
    return cachedExtensionId;
  }

  // Navigate to about:debugging to find extension UUID
  await browser.url('about:debugging#/runtime/this-firefox');

  // Wait for the page to load and extensions to appear
  await browser.pause(3000);

  // Get all links on the page - one should be the manifest.json link
  const links = await $$('a');

  for (const link of links) {
    const href = await link.getAttribute('href');
    if (href && href.includes('moz-extension://')) {
      // Extract UUID from moz-extension://UUID/...
      const match = href.match(/moz-extension:\/\/([a-f0-9-]+)/i);
      if (match) {
        cachedExtensionId = match[1];
        return cachedExtensionId;
      }
    }
  }

  // If no links found, try to get it from the page source
  const pageSource = await browser.getPageSource();
  const sourceMatch = pageSource.match(/moz-extension:\/\/([a-f0-9-]+)/i);
  if (sourceMatch) {
    cachedExtensionId = sourceMatch[1];
    return cachedExtensionId;
  }

  throw new Error('Could not find TabSearch extension UUID in about:debugging');
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

/**
 * Clear the cached extension ID (useful between test runs).
 */
export function clearCache() {
  cachedExtensionId = null;
}
