const POPUP_COMMAND_NAME = '_execute_browser_action';

// Feature detection for Firefox vs Chrome
export function supportsCommandUpdate() {
  return typeof browser !== 'undefined'
    && browser.commands
    && typeof browser.commands.update === 'function';
}

// Get current popup shortcut
export async function getPopupShortcut() {
  const commands = await browser.commands.getAll();
  const popupCommand = commands.find(cmd => cmd.name === POPUP_COMMAND_NAME);
  return popupCommand?.shortcut || '';
}

// Update popup shortcut (Firefox only)
export async function updatePopupShortcut(shortcut) {
  if (!supportsCommandUpdate()) {
    throw new Error('Shortcut updates not supported in this browser');
  }
  await browser.commands.update({
    name: POPUP_COMMAND_NAME,
    shortcut,
  });
}

// Reset to manifest default (Firefox only)
export async function resetPopupShortcut() {
  if (!supportsCommandUpdate()) {
    throw new Error('Shortcut reset not supported in this browser');
  }
  await browser.commands.reset(POPUP_COMMAND_NAME);
}

// Open browser's native shortcut settings
export function getBrowserShortcutSettingsUrl() {
  // Chrome: chrome://extensions/shortcuts
  // Firefox: about:addons with keyboard shortcuts panel
  const isFirefox = typeof browser !== 'undefined' && browser.runtime?.getBrowserInfo;
  return isFirefox ? 'about:addons' : 'chrome://extensions/shortcuts';
}
