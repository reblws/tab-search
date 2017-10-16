import { persistStore } from 'redux-persist';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from '../reducers';

const store = createStore(
  rootReducer,
  applyMiddleware(thunkMiddleware, logger),
);

persistStore(store);

export default store;
