import { CHECKBOX_UPDATE } from '../../actions/types';
import initialState from './initial-settings';
import fuzzyReducer from './fuzzy';

export default function settingsReducer(state = initialState, action) {
  // Parse the action type
  const isFuzzy = action.type.split('/')[0] === 'FUZZY';

  if (isFuzzy) {
    return Object.assign({}, state, { fuzzySearch: fuzzyReducer(
      state.fuzzySearch,
      action,
    ) });
  }

  if (action.type !== CHECKBOX_UPDATE) {
    return state;
  }

  const { key, value } = action.payload;
  return Object.assign({}, state, { [key]: value });
}
