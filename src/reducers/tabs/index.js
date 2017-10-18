import {
  WINDOW_TABS_RECEIVE,
  WINDOW_CLOSE,
  TAB_DELETE,
  TAB_CREATE,
} from '../../actions/types';

const initialState = {
  windowTabs: {},
};

export default function tabsReducer(state = initialState, action) {
  const { windowTabs } = state;
  const { payload, type } = action;
  switch (type) {
    case WINDOW_TABS_RECEIVE: {
      const { windowId, tabs } = payload;
      // Only store the tab id, which is guaranteed to be unique across
      // browser sessions
      // TODO: store sessionId as well
      const nextWindowTabs = Object.assign({}, windowTabs, {
        [String(windowId)]: tabs.map(({ id }) => ({ id })),
      });
      return Object.assign({}, state, { windowTabs: nextWindowTabs });
    }
    case WINDOW_CLOSE: {
      // Nums get coerced to string in when used as object keys
      const closedWindowId = String(payload);
      const activeWindows = Object.keys(windowTabs)
        .reduce((acc, windowId) => {
          if (windowId !== closedWindowId) {
            return Object.assign({}, acc, { [windowId]: windowTabs[windowId] });
          }
          return acc;
        }, {});
      return Object.assign({}, state, { windowTabs: activeWindows });
    }
    case TAB_DELETE: {
      const { tabId, windowId } = payload;
      const nextWindowTabs = windowTabs[windowId].filter(({ id }) => id !== tabId);
      return Object.assign({}, state, {
        windowTabs: Object.assign({}, windowTabs, { [windowId]: nextWindowTabs }),
      });
    }
    case TAB_CREATE: {
      const { tabId, windowId } = payload;
      const nextTabs = [...windowTabs[windowId], tabId];
      const nextWindows = Object.assign({}, windowTabs, { [windowId]: nextTabs });
      return Object.assign({}, state, { windowTabs: nextWindows });
    }
    // case UPDATE_ACTIVE_TAB:
    //   return Object.assign({}, state, { activeTab: payload });
    default:
      return state;
  }
}
