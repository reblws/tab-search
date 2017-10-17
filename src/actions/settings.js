import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  FUZZY,
} from './types';


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

export function updateFuzzyRange(key, value) {
  return {
    type: FUZZY + RANGE_UPDATE,
    payload: {
      key,
      value,
    },
  };
}
