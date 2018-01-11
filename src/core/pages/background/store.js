import { createBackgroundStore } from 'redux-webext';
import store from '../../store';
import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  SEARCH_KEY_UPDATE,
  FUZZY,
  SETTINGS_RESET,
  NUMBER_UPDATE,
  LAST_QUERY_UPDATE,
  KEYBINDING_UPDATE,
  KEYBINDING_DEFAULT_RESET,
} from '../../actions/types';
import {
  updateCheckbox,
  updateFuzzyCheckbox,
  updateFuzzyRange,
  updateFuzzySearchKeys,
  updateNumber,
  resetSettings,
  updateLastQuery,
  updateKeybinding,
  resetDefaultKeybindings,
} from '../../actions';

export default createBackgroundStore({
  store,
  actions: {
    [FUZZY + CHECKBOX_UPDATE]: updateFuzzyCheckbox,
    [FUZZY + RANGE_UPDATE]: updateFuzzyRange,
    [FUZZY + SEARCH_KEY_UPDATE]: updateFuzzySearchKeys,
    [CHECKBOX_UPDATE]: updateCheckbox,
    [SETTINGS_RESET]: resetSettings,
    [NUMBER_UPDATE]: updateNumber,
    [LAST_QUERY_UPDATE]: updateLastQuery,
    [KEYBINDING_UPDATE]: updateKeybinding,
    [KEYBINDING_DEFAULT_RESET]: resetDefaultKeybindings,
  },
});
