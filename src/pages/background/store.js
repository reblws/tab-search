import { createBackgroundStore } from 'redux-webext';
import store from '../../store';
import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  SEARCH_KEY_UPDATE,
  FUZZY,
} from '../../actions/types';
import {
  updateCheckbox,
  updateFuzzyCheckbox,
  updateFuzzyRange,
  updateFuzzySearchKeys,
} from '../../actions/settings';

export default createBackgroundStore({
  store,
  actions: {
    [FUZZY + CHECKBOX_UPDATE]: updateFuzzyCheckbox,
    [FUZZY + RANGE_UPDATE]: updateFuzzyRange,
    [CHECKBOX_UPDATE]: updateCheckbox,
    [FUZZY + SEARCH_KEY_UPDATE]: updateFuzzySearchKeys,
  },
});

// actions: { [uiActionType]: [backgroundAction]  }
