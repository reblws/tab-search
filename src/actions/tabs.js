import * as types from './types';

/* Thunks */
// Loads the active tabs onto the redux store
export function initializeTabs() {
  return (dispatch) => {
    dispatch({
      type: types.TABS_INITIALIZE,
    });
    const dispatchReceiveTabs = ({ id, tabs }) => {
      dispatch(receiveWindowTabs(id, tabs));
    };
    browser.windows.getAll({ populate: true, windowTypes: ['normal'] })
      .then((windows) => {
        windows.forEach(dispatchReceiveTabs);
      })
      .catch((e) => {
        throw new Error(`Ran into a problem loading browser's tabs: ${e}`);
      });
  };
}

export function createWindow(windowId) {
  return (dispatch) => {
    dispatch({
      type: types.WINDOW_CREATE,
    });
    browser.windows.get(windowId, { populate: true })
      .then(({ id, tabs }) => {
        dispatch(receiveWindowTabs(id, tabs));
      })
      .catch((e) => {
        throw new Error(`Ran into trouble interpreting a created window: ${e}`);
      });
  };
}

export function receiveWindowTabs(windowId, tabs) {
  return {
    type: types.WINDOW_TABS_RECEIVE,
    payload: {
      windowId,
      tabs,
    },
  };
}

export function closeWindow(windowId) {
  return {
    type: types.WINDOW_CLOSE,
    payload: windowId,
  };
}

export function deleteTab(tabId, windowId) {
  return {
    type: types.TAB_DELETE,
    payload: {
      tabId,
      windowId,
    },
  };
}

export function createTab(tabId, windowId) {
  return {
    type: types.TAB_CREATE,
    payload: {
      tabId,
      windowId,
    },
  };
}


// Accepts a Tab object and passes the id
export function updateActiveTab(tab) {
  return {
    type: types.ACTVE_TAB_UPDATE,
    payload: tab.id,
  };
}

export function switchTabs(tabId) {
  browser.tabs.update(tabId, { active: true });
}
