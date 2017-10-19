import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  SEARCH_KEY_UPDATE,
  FUZZY,
} from '../actions/types';

export default function fuzzySettingsReducer(state = {
  enableFuzzySearch: true,
  shouldSort: true,
  threshold: 0.5,
  maxPattenLength: 32,
  minMatchCharLength: 1,
  keys: ['title', 'url'],
}, action) {
  const { type } = action;
  switch (type) {
    case FUZZY + SEARCH_KEY_UPDATE: {
      const { value } = action.payload;
      let keys;
      if (value) {
        keys = ['title', 'url'];
      } else {
        keys = ['title'];
      }
      return Object.assign({}, state, { keys });
    }
    case FUZZY + RANGE_UPDATE:
    case FUZZY + CHECKBOX_UPDATE: {
      const { key, value } = action.payload;
      const newSetting = { [key]: value };
      return Object.assign({}, state, newSetting);
    }
    default:
      return state;
  }
}
