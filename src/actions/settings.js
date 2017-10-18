import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  FUZZY,
  SEARCH_KEY_UPDATE,
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
      value: value ? ['title', 'url'] : ['title'],
    },
  };
}
