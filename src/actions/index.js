import * as types from './types';

/* Thunks */
// Loads the active tabs onto the redux store
export function initializeTabs() {
  return (dispatch) => {
    // Query for all window-tabs, it's up to each individual window's popup
    // script to filter the results
    browser.tabs.query({})
      .then(tabs => dispatch(receiveTabs(tabs)))
      .catch(() => {
        throw new Error('Ran into a problem loading browser\'s tabs.');
      });
  };
}

export function deleteTab(tabId) {
  return (dispatch) => {
    browser.tabs.remove(tabId)
      .catch(() => {
        throw new Error('Ran into a problem deleting tabs.');
      });
  };
}


/* Pure actions */
// Reducer for updating the user's settings
export function updateSetting(key, value) {
  return {
    type: types.UPDATE_SETTING,
    payload: {
      key,
      value,
    },
  };
}

export function receiveTabs(tabs) {
  return {
    type: types.RECEIVE_TABS,
    payload: tabs,
  };
}

// Accepts a Tab object and passes the id
export function updateActiveTab(tab) {
  return {
    type: types.UPDATE_ACTIVE_TAB,
    payload: tab.id,
  };
}

export function switchTabs(tabId) {
  browser.tabs.update(tabId, { active: true });
}
