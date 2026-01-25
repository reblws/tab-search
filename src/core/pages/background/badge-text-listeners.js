import { debounce } from 'core/utils/debounce';

// Shorthand
// t -> browser.tabs
// setBadgeText -> browser.browserAction.setBadgeText
const { tabs: t } = browser;
const { setBadgeText } = browser.browserAction;

const ADD_LISTENER = 'addListener';
const REMOVE_LISTENER = 'removeListener';

const LOADING_TEXT = '...';

// Save the debounced funcs here so we can remove it with the exact same handler
const debounceHandleOnCreatedTab = debounce(handleOnCreatedTab, 50);
const debounceHandleOnRemovedTab = debounce(handleOnRemovedTab, 50);

// Mapping from tab events to their handlers
// { [<event>]: <handler> }
const eventListenerMap = {
  onCreated: debounceHandleOnCreatedTab,
  onRemoved: debounceHandleOnRemovedTab,
  onUpdated: handleOnUpdatedTab,
  onDetached: handleOnDetachedTab,
};

const doListeners = (browserTabObject) => (method) => (listenerMap) => {
  Object.keys(listenerMap).forEach((eventKey) => {
    const handler = listenerMap[eventKey];
    browserTabObject[eventKey][method](handler);
  });
};

// listenerMap -> null: applys allevent listeners specified in the listenerMap
const addBadgeTextListeners = doListeners(t)(ADD_LISTENER);
const removeBadgeTextListeners = doListeners(t)(REMOVE_LISTENER);

const WINDOW_OPTIONS = {
  populate: true,
  windowTypes: ['normal'],
};

const updateTabInWindow = (windowId) => (tabId) =>
  browser.windows
    .get(windowId, WINDOW_OPTIONS)
    .then(({ tabs }) => String(tabs.length))
    .then((text) => setBadgeText({ text, tabId }));

export function startCountingBadgeTextAndAddListeners() {
  setInitialBadgeTextInAllWindows();
  addBadgeTextListeners(eventListenerMap);
}

export function stopCountingBadgeTextAndRemoveListeners() {
  clearAllBadgeText();
  removeBadgeTextListeners(eventListenerMap);
}

function setInitialBadgeTextInAllWindows() {
  setBadgeText({ text: LOADING_TEXT });
  browser.windows
    .getAll(WINDOW_OPTIONS)
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
  t.query({}).then((tabs) => {
    tabs.forEach(({ id: tabId }) => {
      setBadgeText({
        text: '',
        tabId,
      });
    });
  });
}

const promiseBadgeTextWindowUpdate = (windowId) =>
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
  t.get(tabId)
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
  const { windowId, id, status } = tab;
  // Wait for completion before updating the text
  if (status !== 'complete') return;
  return updateTabInWindow(windowId)(id);
}
