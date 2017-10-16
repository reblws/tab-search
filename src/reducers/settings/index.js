import { persistReducer } from 'redux-persist';
import settingsReducer from './settings';
import storage from '../../store/storage-adapter';

const config = {
  key: 'root',
  storage,
  debug: true,
};

export default persistReducer(config, settingsReducer);
