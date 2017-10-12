import { RECEIVE_TABS } from '../actions/types';

const initialState = {
  loadedTabs: [],
};

export default function tabs(state = initialState, action) {
  const { payload } = action;
  switch (action.type) {
    case RECEIVE_TABS:
      return Object.assign({}, state, { loadedTabs: payload });
    // case UPDATE_ACTIVE_TAB:
    //   return Object.assign({}, state, { activeTab: payload });
    default:
      return state;
  }
}
