import { combineReducers } from 'redux';
import tabs from './tabs';
import settings from './settings';

export default combineReducers({
  tabs,
  settings,
});
