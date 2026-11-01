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
