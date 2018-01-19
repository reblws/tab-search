import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  FUZZY,
  SEARCH_KEY_UPDATE,
  SETTINGS_RESET,
  SETTING_RESET,
  NUMBER_UPDATE,
  LAST_QUERY_UPDATE,
  KEYBINDING_UPDATE,
  KEYBINDING_DEFAULT_RESET,
} from './types';
import { action } from './action';

// When action is passed in from ui store the background passes the entire
// action as an input
export function updateCheckbox({ payload: { key, value } }) {
  return action(CHECKBOX_UPDATE, key, value);
}

export function updateFuzzyCheckbox({ payload: { key, value } }) {
  return action(FUZZY + CHECKBOX_UPDATE, key, value);
}

export function updateFuzzyRange({ payload: { key, value } }) {
  return action(FUZZY + RANGE_UPDATE, key, value);
}

export function updateFuzzySearchKeys({ payload: { value } }) {
  return action(FUZZY + SEARCH_KEY_UPDATE, 'keys', value);
}

export function updateNumber({ payload: { key, value } }) {
  return action(NUMBER_UPDATE, key, value);
}

export function resetSettings() {
  return action(SETTINGS_RESET);
}

export function resetSetting({ payload: { key } }) {
  return action(SETTING_RESET, key);
}

export function updateLastQuery(a) {
  return action(LAST_QUERY_UPDATE, a.payload.key);
}

export function updateKeybinding({ payload: { key, value } }) {
  return action(KEYBINDING_UPDATE, key, value);
}

export function resetDefaultKeybindings() {
  return action(KEYBINDING_DEFAULT_RESET);
}

