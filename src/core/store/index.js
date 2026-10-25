import { persistStore } from 'redux-persist';
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import rootReducer from '../reducers';

const middleware = [logger];
const store = createStore(
  rootReducer,
  applyMiddleware(...middleware),
);

// Resolves once redux-persist has loaded the saved settings into the store
export const rehydrated = new Promise((resolve) => {
  persistStore(store, null, resolve);
});

export default store;
