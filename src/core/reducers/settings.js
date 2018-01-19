import { CHECKBOX_UPDATE, SETTINGS_RESET, NUMBER_UPDATE, SETTING_RESET } from '../actions/types';
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
      const [reducer, k] = key.split('.');
      const g = initialGeneralSettings;
      if (reducer === 'general' && k in g) {
        return Object.assign({}, state, { [k]: g[k] });
      }
      return state;
    }
    case NUMBER_UPDATE: {
      const { key, value } = action.payload;
      return Object.assign({}, state, { [key]: parseInt(value, 10) });
    }
    default:
      return state;
  }
}
