import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  SEARCH_KEY_UPDATE,
  FUZZY,
  SETTINGS_RESET,
  SETTING_RESET,
} from '../actions/types';
import { initialFuzzySettings } from './defaults';

export default function fuzzySettingsReducer(
  state = initialFuzzySettings,
  action
) {
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
    case SETTINGS_RESET: {
      return initialFuzzySettings;
    }
    case SETTING_RESET: {
      const { key } = action.payload;
      const [reducer, k] = key.split('.');
      const f = initialFuzzySettings;
      if (reducer === 'fuzzy' && k in f) {
        return Object.assign({}, state, { [k]: f[k] });
      }
      return state;
    }
    default:
      return state;
  }
}
