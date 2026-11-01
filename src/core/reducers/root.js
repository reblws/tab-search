import { combineReducers } from 'redux';
import fuzzySettingsReducer from './fuzzy-settings';
import generalSettingsReducer from './settings';
import keyboardConfigReducer from './keyboard';
import colorSettingsReducer from './colors';
import defaultStateReducer from './state';

// The state slice is passed in so the shell can wrap it with its own
// persistence
export function createRootReducer({ stateReducer = defaultStateReducer } = {}) {
  return combineReducers({
    fuzzy: fuzzySettingsReducer,
    general: generalSettingsReducer,
    state: stateReducer,
    keyboard: keyboardConfigReducer,
    color: colorSettingsReducer,
  });
}
