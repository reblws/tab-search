import { persistStore } from 'redux-persist';
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import { createPersistedReducer } from '../reducers/persist';

const middleware = [logger];
const store = createStore(
  createPersistedReducer(browser.storage),
  applyMiddleware(...middleware),
);

// Resolves once redux-persist has loaded the saved settings into the store
export const rehydrated = new Promise((resolve) => {
  persistStore(store, null, resolve);
});

export default store;
