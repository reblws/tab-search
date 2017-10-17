import * as types from './types';

export function updateField(key, value) {
  return {
    type: types.SETTING_UPDATE,
    payload: {
      key,
      value,
    },
  };
}
