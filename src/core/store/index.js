import { persistStore } from 'redux-persist';
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import rootReducer from '../reducers';

const middleware = [thunkMiddleware, logger];
const store = createStore(
  rootReducer,
  applyMiddleware(...middleware),
);

persistStore(store);

export default store;
