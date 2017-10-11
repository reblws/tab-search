import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from '../reducers';

export default createStore(
  rootReducer,
  applyMiddleware(thunkMiddleware, logger),
);
