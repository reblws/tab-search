import { CHECKBOX_UPDATE, SETTINGS_RESET } from '../actions/types';
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
    default:
      return state;
  }
}
