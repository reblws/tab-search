import {
  CHECKBOX_UPDATE,
  SETTINGS_RESET,
  NUMBER_UPDATE,
  SETTING_RESET,
  SELECT_UPDATE,
} from '../actions/types';
import { initialGeneralSettings } from './defaults';

export default function generalSettingsReducer(state = initialGeneralSettings, action) {
  // Parse the action type
  const { type } = action;
  switch (type) {
    case CHECKBOX_UPDATE: {
      const { key, value } = action.payload;
      return Object.assign({}, state, { [key]: value });
    }
    case SETTINGS_RESET: {
      return initialGeneralSettings;
    }
    case SETTING_RESET: {
      const { key } = action.payload;
      const g = initialGeneralSettings;
      const [reducer, k] = key.split('.');
      if (reducer === 'general' && k in state) {
        return Object.assign({}, state, { [k]: g[k] });
      }
      return state;
    }
    case NUMBER_UPDATE: {
      const { key, value } = action.payload;
      return Object.assign({}, state, { [key]: parseInt(value, 10) });
    }
    case SELECT_UPDATE: {
      const { key, value } = action.payload;
      return Object.assign({}, state, { [key]: value });
    }
    default:
      return state;
  }
}
