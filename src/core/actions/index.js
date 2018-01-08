import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  FUZZY,
  SEARCH_KEY_UPDATE,
  SETTINGS_RESET,
  NUMBER_UPDATE,
  LAST_QUERY_UPDATE,
  KEYBINDING_UPDATE,
} from './types';

// When action is passed in from ui store the background passes the entire
// action as an input
export function updateCheckbox({ payload }) {
  const { key, value } = payload;
  return {
    type: CHECKBOX_UPDATE,
    payload: {
      key,
      value,
    },
  };
}

export function updateFuzzyCheckbox({ payload }) {
  const { key, value } = payload;
  return {
    type: FUZZY + CHECKBOX_UPDATE,
    payload: {
      key,
      value,
    },
  };
}

export function updateFuzzyRange({ payload }) {
  const { key, value } = payload;
  return {
    type: FUZZY + RANGE_UPDATE,
    payload: {
      key,
      value,
    },
  };
}

export function updateFuzzySearchKeys({ payload }) {
  const { value } = payload;
  return {
    type: FUZZY + SEARCH_KEY_UPDATE,
    payload: {
      key: 'keys',
      value,
    },
  };
}

export function updateNumber({ payload: { key, value } }) {
  return {
    type: NUMBER_UPDATE,
    payload: { key, value },
  };
}

export function resetSettings() {
  return {
    type: SETTINGS_RESET,
  };
}

export function updateLastQuery({ payload }) {
  return {
    type: LAST_QUERY_UPDATE,
    payload,
  };
}

export function updateKeybinding({ payload }) {
  return {
    type: KEYBINDING_UPDATE,
    payload,
  };
}
