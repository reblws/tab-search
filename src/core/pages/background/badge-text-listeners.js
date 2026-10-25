import debounce from 'debounce';
import { setBadgeText } from 'core/utils/action-api';

const LOADING_TEXT = '...';

// Debounce once here so every event of a burst shares the same timer
const debounceHandleOnCreatedTab = debounce(handleOnCreatedTab, 50);
const debounceHandleOnRemovedTab = debounce(handleOnRemovedTab, 50);
// onUpdated fires for every loaded page; on FF 157+ (Nova) the resulting
// windows.get(populate) IPC storm can wedge the background process
// (reblws/tab-search#117), so coalesce bursts
const debounceHandleOnUpdatedTab = debounce(handleOnUpdatedTab, 150);

// Mapping from tab events to their handlers
// { [<event>]: <handler> }
const eventListenerMap = {
  onCreated: debounceHandleOnCreatedTab,
  onRemoved: debounceHandleOnRemovedTab,
  onUpdated: debounceHandleOnUpdatedTab,
  onDetached: handleOnDetachedTab,
};

// MV3 service workers only get woken for events whose listeners were added
// synchronously on startup, so the listeners stay attached for the worker's
// lifetime and each event checks whether counting is on instead.
// isCounting: () -> Promise<Boolean>
let isCountingNow = () => Promise.resolve(false);

// Handlers run up to ~250ms after their event (debounce, plus a timeout for
// removals), so check again right before writing the badge: counting may
// have been turned off meanwhile.
const ifStillCounting = fn => (...args) => isCountingNow().then((counting) => {
  if (counting) fn(...args);
});

export function addBadgeTextListeners(isCounting) {
  isCountingNow = isCounting;
  Object.keys(eventListenerMap).forEach((eventKey) => {
    const handler = eventListenerMap[eventKey];
    browser.tabs[eventKey].addListener((...args) => {
      isCounting().then((counting) => {
        if (counting) handler(...args);
      });
    });
  });
}

const WINDOW_OPTIONS = {
  populate: true,
  windowTypes: ['normal'],
};

const updateTabInWindow = windowId => tabId =>
  browser.windows.get(windowId, WINDOW_OPTIONS)
    .then(({ tabs }) => String(tabs.length))
    .then(ifStillCounting(text => setBadgeText({ text, tabId })));

export function startCountingBadgeText() {
  setInitialBadgeTextInAllWindows();
}

export function stopCountingBadgeText() {
  // Drop updates still waiting on their debounce timer
  debounceHandleOnCreatedTab.clear();
  debounceHandleOnRemovedTab.clear();
  debounceHandleOnUpdatedTab.clear();
  clearAllBadgeText();
}

function setInitialBadgeTextInAllWindows() {
  setBadgeText({ text: LOADING_TEXT });
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


function updateWindowBadgeText(browserWindow) {
  const { tabs } = browserWindow;
  const text = String(tabs.length);
  tabs.forEach(({ id: tabId }) => setBadgeText({ text, tabId }));
}

function clearAllBadgeText() {
  setBadgeText({ text: '' });
  browser.tabs.query({}).then((tabs) => {
    tabs.forEach(({ id: tabId }) => {
      setBadgeText({
        text: '',
        tabId,
      });
    });
  });
}

const promiseBadgeTextWindowUpdate = windowId =>
  browser.windows.get(windowId, WINDOW_OPTIONS).then(ifStillCounting(updateWindowBadgeText));

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

