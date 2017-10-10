import { createBackgroundStore } from 'redux-webext';
import store from '../../store';
import {
  INITIALIZE_TABS,
  DELETE_TAB,
  SWITCH_TAB,
} from '../../actions/types';
import {
  initializeTabs,
  deleteTab,
  switchTab,
} from '../../actions';

export default createBackgroundStore({
  store,
  actions: {
    [INITIALIZE_TABS]: initializeTabs,
    [DELETE_TAB]: deleteTab,
    [SWITCH_TAB]: switchTab,
  },
});
