import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import fuzzySettingsReducer from './fuzzy-settings';
import generalSettingsReducer from './settings';
import stateReducer from './state';
import storage from './services/storage-adapter';

const persistConfig = {
  key: 'root',
  storage,
  serialize: false,
  blacklist: ['state'],
};


const rootReducer = combineReducers({
  fuzzy: fuzzySettingsReducer,
  general: generalSettingsReducer,
  state: stateReducer,
});

export default persistReducer(persistConfig, rootReducer);
