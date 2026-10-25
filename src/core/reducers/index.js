import { combineReducers } from 'redux';
import { persistReducer, createMigrate } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import fuzzySettingsReducer from './fuzzy-settings';
import generalSettingsReducer from './settings';
import keyboardConfigReducer from './keyboard';
import colorSettingsReducer from './colors';
import stateReducer from './state';
import { createStorageAdapter } from './services/storage-adapter';
import migrations from './services/migrations';

// Settings go to storage.local. The transient `state` slice (the last
// query) never does: it goes to storage.session when there is one, which
// is cleared with the browser session. An MV3 service worker is discarded
// ~30s after the popup closes, so in-memory state would be lost; the MV2
// background page lives for the whole session, so in memory is enough.
// persistStore() waits for both, so `rehydrated` in core/store covers them.
export function createRootReducer({ local, session } = browser.storage) {
  const persistConfig = {
    key: 'root',
    storage: createStorageAdapter(local),
    blacklist: ['state'],
    stateReconciler: autoMergeLevel2,
    version: 0,
    migrate: createMigrate(migrations, {
      debug: process.env.NODE_ENV === 'development',
    }),
  };

  const state = session
    ? persistReducer({ key: 'state', storage: createStorageAdapter(session) }, stateReducer)
    : stateReducer;

  const rootReducer = combineReducers({
    fuzzy: fuzzySettingsReducer,
    general: generalSettingsReducer,
    state,
    keyboard: keyboardConfigReducer,
    color: colorSettingsReducer,
  });

  return persistReducer(persistConfig, rootReducer);
}

export default createRootReducer();
