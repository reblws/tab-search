import { RECEIVE_TABS, UPDATE_ACTIVE_TAB } from '../actions/types';

const initialState = {
  activeTab: undefined,
  loadedTabs: [],
};

export default function tabs(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_TABS:
      return Object.assign({}, state, { tabs: action.payload });
    case UPDATE_ACTIVE_TAB:
      return Object.assign({}, state, { activeTab: action.payload });
    default:
      return state;
  }
}
