export function getCurrentWindowId() {
  return browser.windows.getCurrent().then(({ id }) => id);
}

export function focusWindow(windowId) {
  return browser.windows.update(
    parseInt(windowId, 10),
    {
      drawAttention: true,
      focused: true,
    },
  );
}

export function getWindow(windowId) {
  return browser.windows.get(windowId);
}

// A small window without tabs or an address bar
export function createPopupWindow(url, bounds) {
  return browser.windows.create(Object.assign({ url, type: 'popup' }, bounds));
}
