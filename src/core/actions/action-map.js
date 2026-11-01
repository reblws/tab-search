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
} from './types';

// The action types the popup and settings pages may dispatch to the
// background store
export const UI_ACTION_TYPES = [
  FUZZY + CHECKBOX_UPDATE,
  FUZZY + RANGE_UPDATE,
  FUZZY + SEARCH_KEY_UPDATE,
  CHECKBOX_UPDATE,
  SETTINGS_RESET,
  NUMBER_UPDATE,
  LAST_QUERY_UPDATE,
  KEYBINDING_UPDATE,
  KEYBINDING_DEFAULT_RESET,
  SETTING_RESET,
  COLOR_UPDATE,
  SECONDARY_KEYBINDING_UPDATE,
  SECONDARY_KEYBINDING_REMOVE,
  SELECT_UPDATE,
];

// { [type]: act => act with that type }, as the background bridge expects
export function createActionMap(types) {
  return types.reduce(
    (acc, type) => Object.assign(acc, { [type]: act => ({ ...act, type }) }),
    {},
  );
}
