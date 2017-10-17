import { TABS_RECEIVE } from '../../actions/types';

const initialState = {
  loadedTabs: [],
};

export default function tabsReducer(state = initialState, action) {
  const { payload } = action;
  switch (action.type) {
    case TABS_RECEIVE:
      return Object.assign({}, state, { loadedTabs: payload });
    // case UPDATE_ACTIVE_TAB:
    //   return Object.assign({}, state, { activeTab: payload });
    default:
      return state;
  }
}
