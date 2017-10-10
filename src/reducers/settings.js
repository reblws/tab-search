import { UPDATE_SETTING } from '../actions/types';

const initialState = {
  showTabCount: false,
  searchAllWindows: false,
  fuzzySearch: true,
};

export default function settings(state = initialState, action) {
  if (action.type !== UPDATE_SETTING) {
    return state;
  }
  const { key, value } = action.payload;
  return Object.assign({}, state, { [key]: value });
}
