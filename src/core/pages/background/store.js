import { createBackgroundStore } from 'redux-webext';
import store from 'core/store';
import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  SEARCH_KEY_UPDATE,
  FUZZY,
  SETTINGS_RESET,
  SETTING_RESET,
  NUMBER_UPDATE,
  LAST_QUERY_UPDATE,
  KEYBINDING_UPDATE,
  SECONDARY_KEYBINDING_UPDATE,
  SECONDARY_KEYBINDING_REMOVE,
  KEYBINDING_DEFAULT_RESET,
  COLOR_UPDATE,
} from 'core/actions/types';

const identity = x => x;

export default createBackgroundStore({
  store,
  actions: {
    [FUZZY + CHECKBOX_UPDATE]: identity,
    [FUZZY + RANGE_UPDATE]: identity,
    [FUZZY + SEARCH_KEY_UPDATE]: identity,
    [CHECKBOX_UPDATE]: identity,
    [SETTINGS_RESET]: identity,
    [NUMBER_UPDATE]: identity,
    [LAST_QUERY_UPDATE]: identity,
    [KEYBINDING_UPDATE]: identity,
    [KEYBINDING_DEFAULT_RESET]: identity,
    [SETTING_RESET]: identity,
    [COLOR_UPDATE]: identity,
    [SECONDARY_KEYBINDING_UPDATE]: identity,
    [SECONDARY_KEYBINDING_REMOVE]: identity,
  },
});
