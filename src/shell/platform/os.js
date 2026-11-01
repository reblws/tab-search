import { POPUP_COMMAND } from './action-api';

export function getUserOs() {
  return browser.runtime.getPlatformInfo().then(({ os }) => os);
}

// Returns the user's shortcut for the extension
// () -> Promise< shortcut: String >
export async function getOsShortcut() {
  const [os, commands] = await Promise.all([
    getUserOs(),
    browser.commands.getAll(),
  ]);
  const popupCommand = commands.find(cmd => cmd.name === POPUP_COMMAND);
  const shortcut = popupCommand?.shortcut || '';

  // Replace Ctrl with Cmd on Mac for display
  if (os === 'mac') {
    return shortcut.replace(/ctrl/i, 'Cmd');
  }
  return shortcut;
}
