import {
  SETTING_RESET,
  SETTINGS_RESET,
  COLOR_UPDATE,
} from '../actions/types';
import { initialColorSettings } from './defaults';

export default function colorSettingsReducer(
  state = initialColorSettings,
  action,
) {
  const { type } = action;
  switch (type) {
    case COLOR_UPDATE: {
      const { key, value } = action.payload;
      return Object.assign(
        {},
        state,
        { [key]: value },
      );
    }
    case SETTING_RESET: {
      const { key } = action.payload;
      const [reducer, k] = key.split('.');
      if (reducer === 'color' && k in state) {
        return Object.assign({}, state, { [k]: initialColorSettings[k] });
      }
      return state;
    }
    case SETTINGS_RESET: return initialColorSettings;
    default: return state;
  }
}
