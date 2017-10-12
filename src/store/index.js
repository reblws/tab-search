import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import { persistStore, autoRehydrate } from 'redux-persist';
import rootReducer from '../reducers';

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunkMiddleware, logger),
    autoRehydrate(),
  ),
);

persistStore(store, {
  whitelist: ['settings'],
});

export default store;
