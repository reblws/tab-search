import {
  deleteTab,
  closeWindow,
  createWindow,
  createTab,
} from '../../actions/tabs';

// export default function addBackgroundListeners(dispatch) {
//   const updateTabs = () => {
//     dispatch(initializeTabs());
//   };
//   const events = [
//     browser.tabs.onCreated,
//     browser.tabs.onRemoved,
//     browser.tabs.onReplaced,
//     browser.tabs.onUpdated,
//   ];
//   // Repopulate the tabs object every time a tab is modified.
//   events.forEach((event) => {
//     // event.addListener(updateTabs);
//   });
// }

export const dispatchCloseWindow = dispatch => (windowId) => {
  dispatch(closeWindow(windowId));
};

export const dispatchCreateWindow = dispatch => ({ id }) => {
  dispatch(createWindow(id));
};

export const dispatchDeleteTab = dispatch => (tabId, removeInfo) => {
  const { windowId, isWindowClosing } = removeInfo;
  if (!isWindowClosing) {
    dispatch(deleteTab(tabId, windowId));
  }
};

export const dispatchCreateTab = dispatch => ({ id, windowId }) => {
  dispatch(createTab(id, windowId));
};
