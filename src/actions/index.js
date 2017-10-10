import * as types from './types';

/* Thunks */
// Loads the active tabs onto the redux store
export function initializeTabs() {
  return (dispatch) => {
    // Query for all window-tabs, it's up to each individual window's popup
    // script to filter the results
    browser.tabs.query()
      .then(tabs => dispatch(receiveTabs(tabs)))
      .catch(() => {
        throw new Error('Ran into a problem loading browser\'s tabs.');
      });
    browser.tabs.getCurrent()
      .then(currentTab => dispatch(updateActiveTab(currentTab)));
  };
}

export function deleteTab(tabId) {
  return dispatch => 'foo';
}

export function switchTab(tabId) {
  return (dispatch) => {
    browser.tabs.update(tabId, { active: true })
      .then(updatedTab => dispatch(updateActiveTab(updatedTab)))
      .catch((err) => {
        throw new Error(`Ran into an error switching the active tab. ${err}`);
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
export function updateActiveTab({ id }) {
  return {
    type: types.UPDATE_ACTIVE_TAB,
    payload: id,
  };
}
