import { CHECKBOX_UPDATE } from '../actions/types';

export default function generalSettingsReducer(state = {
  showTabCountBadgeText: false,
  showBookmarks: false,
  showRecentlyClosed: false,
  searchAllWindows: false,
  enableOverlay: false,
}, action) {
  // Parse the action type
  if (action.type !== CHECKBOX_UPDATE) {
    return state;
  }

  const { key, value } = action.payload;
  return Object.assign({}, state, { [key]: value });
}
