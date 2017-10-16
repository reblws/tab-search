import { persistStore, persistReducer } from 'redux-persist';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import storage from './storage-adapter';
import rootReducer from '../reducers';


function configureStore() {
  let store = createStore(
    rootReducer,
    applyMiddleware(thunkMiddleware, logger),
  );
  let persistor = persistStore(store);
  return { persistor, store };
}

export default store;
