import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  FUZZY,
  SEARCH_KEY_UPDATE,
  SETTINGS_RESET,
} from '../../actions/types';

export function updateCheckbox(key, value) {
  return {
    type: CHECKBOX_UPDATE,
    payload: {
      key,
      value,
    },
  };
}

export function updateFuzzyCheckbox(key, value) {
  return {
    type: FUZZY + CHECKBOX_UPDATE,
    payload: {
      key,
      value,
    },
  };
}

export function updateFuzzyThresholdRange(value) {
  return {
    type: FUZZY + RANGE_UPDATE,
    payload: {
      key: 'threshold',
      value: value / 10,
    },
  };
}

export function updateFuzzySearchKeys(value) {
  return {
    type: FUZZY + SEARCH_KEY_UPDATE,
    payload: {
      key: 'keys',
      value,
    },
  };
}

export function resetSettings() {
  return {
    type: SETTINGS_RESET,
  };
}
