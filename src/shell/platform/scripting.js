// Runs a script file in a tab. The Firefox build is MV2, where
// tabs.executeScript works back to its minimum version; the Chrome build is
// MV3, which only has scripting.executeScript. Each build drops the other
// branch, so web-ext lint doesn't flag an API Firefox 64 lacks.
export function executeScriptFile(tabId, file) {
  if (process.env.BROWSER === 'firefox') {
    return browser.tabs.executeScript(tabId, { file });
  }
  return browser.scripting.executeScript({ target: { tabId }, files: [file] });
}
