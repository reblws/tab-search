import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import fuzzySettingsReducer from './fuzzy-settings';
import generalSettingsReducer from './settings';
import storage from '../store/storage-adapter';
import getStoredState from './get-stored-state';

const persistConfig = {
  key: 'root',
  storage,
  getStoredState,
};


const rootReducer = combineReducers({
  fuzzy: fuzzySettingsReducer,
  general: generalSettingsReducer,
});

export default persistReducer(persistConfig, rootReducer);
