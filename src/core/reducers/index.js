import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import fuzzySettingsReducer from './fuzzy-settings';
import generalSettingsReducer from './settings';
import keyboardConfigReducer from './keyboard';
import colorSettingsReducer from './colors';
import stateReducer from './state';
import storage from './services/storage-adapter';

const persistConfig = {
  key: 'root',
  storage,
  serialize: false,
  blacklist: ['state'],
  stateReconciler: autoMergeLevel2,
  // Unversioned configs are set to -1 by default
  // TODO: Write migrations
  version: 0,
};


const rootReducer = combineReducers({
  fuzzy: fuzzySettingsReducer,
  general: generalSettingsReducer,
  state: stateReducer,
  keyboard: keyboardConfigReducer,
  color: colorSettingsReducer,
});

export default persistReducer(persistConfig, rootReducer);
