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
  SELECT_UPDATE,
} from 'core/actions/types';

export default createBackgroundStore({
  store,
  actions: {
    [FUZZY + CHECKBOX_UPDATE]: act => Object.assign(act, { type: FUZZY + CHECKBOX_UPDATE }),
    [FUZZY + RANGE_UPDATE]: act => Object.assign(act, { type: FUZZY + RANGE_UPDATE }),
    [FUZZY + SEARCH_KEY_UPDATE]: act => Object.assign(act, { type: FUZZY + SEARCH_KEY_UPDATE }),
    [CHECKBOX_UPDATE]: act => Object.assign(act, { type: CHECKBOX_UPDATE }),
    [SETTINGS_RESET]: act => Object.assign(act, { type: SETTINGS_RESET }),
    [NUMBER_UPDATE]: act => Object.assign(act, { type: NUMBER_UPDATE }),
    [LAST_QUERY_UPDATE]: act => Object.assign(act, { type: LAST_QUERY_UPDATE }),
    [KEYBINDING_UPDATE]: act => Object.assign(act, { type: KEYBINDING_UPDATE }),
    [KEYBINDING_DEFAULT_RESET]: act => Object.assign(act, { type: KEYBINDING_DEFAULT_RESET }),
    [SETTING_RESET]: act => Object.assign(act, { type: SETTING_RESET }),
    [COLOR_UPDATE]: act => Object.assign(act, { type: COLOR_UPDATE }),
    [SECONDARY_KEYBINDING_UPDATE]: act => Object.assign(act, { type: SECONDARY_KEYBINDING_UPDATE }),
    [SECONDARY_KEYBINDING_REMOVE]: act => Object.assign(act, { type: SECONDARY_KEYBINDING_REMOVE }),
    [SELECT_UPDATE]: act => Object.assign(act, { type: SELECT_UPDATE }),
  },
});
