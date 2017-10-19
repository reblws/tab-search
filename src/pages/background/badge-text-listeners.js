const windowOptions = {
  populate: true,
  windowTypes: ['normal'],
};

export function startCountingBadgeTextAndAddListeners() {
  setBadgeTextInAllWindows();
  browser.tabs.onCreated.addListener(handleOnCreatedTab);
  browser.tabs.onRemoved.addListener(handleOnRemovedTab);
  browser.tabs.onDetached.addListener(handleOnDetachedTab);
}

export function stopCountingBadgeTextAndRemoveListeners() {
  // clear
  browser.tabs.query({}).then((tabs) => {
    tabs.forEach(({ id }) => {
      browser.browserAction.setBadgeText({
        text: '',
        tabId: id,
      });
    });
  });
  // Remove tab listeners
  browser.tabs.onCreated.removeListener(handleOnCreatedTab);
  browser.tabs.onRemoved.removeListener(handleOnRemovedTab);
  browser.tabs.onDetached.removeListener(handleOnDetachedTab);
}

function updateWindowBadgeText(browserWindow) {
  const { tabs } = browserWindow;
  const windowTabCount = String(tabs.length);
  tabs.forEach(({ id }) => {
    browser.browserAction.setBadgeText({
      text: windowTabCount,
      tabId: id,
    });
  });
}

function setBadgeTextInAllWindows() {
  browser.windows.getAll(windowOptions)
    .then((windows) => {
      windows.forEach(updateWindowBadgeText);
      return windows;
    })
    .catch((e) => {
      throw new Error(`
        Ran into trouble initializing badge texts in each window: ${e}
      `);
    });
}

const promiseBadgeTextWindowUpdate = windowId =>
  browser.windows.get(windowId, windowOptions).then(updateWindowBadgeText);

function handleOnCreatedTab({ windowId }) {
  promiseBadgeTextWindowUpdate(windowId).catch((e) => {
    throw new Error(`
      Ran into problem handling created tab when watching for badge text updates: ${e}
    `);
  });
}

function handleOnRemovedTab(_, removeInfo) {
  const { windowId, isWindowClosing } = removeInfo;
  if (isWindowClosing) {
    return;
  }
  // Need to set a short timeout to avoid "Error: Invalid tab ID"
  // Don't know why that happens since we're not operating on the tabId at all
  setTimeout(() => {
    promiseBadgeTextWindowUpdate(windowId).catch((e) => {
      throw new Error(`
        Ran into problem handling removed tab when watching for badge text updates:
        ${e}
      `);
    });
  }, 100);
}

function handleOnDetachedTab(tabId, detachInfo) {
  const { oldWindowId } = detachInfo;
  promiseBadgeTextWindowUpdate(oldWindowId);
  browser.tabs.get(tabId)
    .then((detachedTabDetails) => {
      const { windowId } = detachedTabDetails;
      return promiseBadgeTextWindowUpdate(windowId);
    })
    .catch((e) => {
      throw new Error(`
        Ran into problem handling detached tab when watching for badge text
        updates: ${e}
      `);
    });
}
