import debounce from 'debounce';

const WINDOW_OPTIONS = {
  populate: true,
  windowTypes: ['normal'],
};

const updateTabInWindow = windowId => tabId =>
  browser.windows.get(windowId, WINDOW_OPTIONS)
    .then(({ tabs }) => String(tabs.length))
    .then(text => browser.browserAction.setBadgeText({
      text,
      tabId,
    }));

// Save the debounced funcs here so we can remove it with the exact same handler
let debounceHandleOnCreatedTab;
let debounceHandleOnRemovedTab;
export function startCountingBadgeTextAndAddListeners() {
  setBadgeTextInAllWindows();
  debounceHandleOnCreatedTab = debounce(handleOnCreatedTab, 50);
  debounceHandleOnRemovedTab = debounce(handleOnRemovedTab, 50);
  browser.tabs.onCreated.addListener(debounceHandleOnCreatedTab);
  browser.tabs.onRemoved.addListener(debounceHandleOnRemovedTab);
  browser.tabs.onDetached.addListener(handleOnDetachedTab);
  // browser.tabs.onActivated.addListener(handleOnActivatedTab);
  browser.tabs.onUpdated.addListener(handleOnUpdatedTab);
}

export function stopCountingBadgeTextAndRemoveListeners() {
  // clear
  browser.browserAction.setBadgeText({ text: '' });
  browser.tabs.query({}).then((tabs) => {
    tabs.forEach(({ id }) => {
      browser.browserAction.setBadgeText({
        text: '',
        tabId: id,
      });
    });
  });
  // Remove tab listeners
  if (debounceHandleOnCreatedTab || debounceHandleOnRemovedTab) {
    browser.tabs.onDetached.removeListener(debounceHandleOnRemovedTab);
    browser.tabs.onCreated.removeListener(debounceHandleOnCreatedTab);
    debounceHandleOnCreatedTab = undefined;
    debounceHandleOnRemovedTab = undefined;
  }
  browser.tabs.onRemoved.removeListener(handleOnRemovedTab);
  browser.tabs.onUpdated.removeListener(handleOnUpdatedTab);
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
  browser.windows.getAll(WINDOW_OPTIONS)
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
  browser.windows.get(windowId, WINDOW_OPTIONS).then(updateWindowBadgeText);

function handleOnCreatedTab({ windowId }) {
  // TODO: debounce
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

// Badge text gets reset when navigating to a new tab
function handleOnUpdatedTab(_, __, tab) {
  const {
    windowId,
    id,
    status,
  } = tab;
  // Wait for completion before updating the text
  if (status !== 'complete') return;
  return updateTabInWindow(windowId)(id);
}

