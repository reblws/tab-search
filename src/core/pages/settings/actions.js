import { action } from 'core/actions/action';
import {
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  FUZZY,
  SEARCH_KEY_UPDATE,
  SETTINGS_RESET,
  SETTING_RESET,
  NUMBER_UPDATE,
  KEYBINDING_UPDATE,
  SECONDARY_KEYBINDING_UPDATE,
  KEYBINDING_DEFAULT_RESET,
  COLOR_UPDATE,
  SECONDARY_KEYBINDING_REMOVE,
} from '../../actions/types';
import inputReducerMap from './inputs-to-reducer';

export const updateNumber = (key, value) => action(NUMBER_UPDATE, key, value);
export const updateCheckbox = (key, value) =>
  action(CHECKBOX_UPDATE, key, value);
export const updateFuzzyCheckbox = (key, value) =>
  action(FUZZY + CHECKBOX_UPDATE, key, value);
export const updateFuzzyThresholdRange = (value) =>
  action(FUZZY + RANGE_UPDATE, 'threshold', value / 10);
export const updateFuzzySearchKeys = (value) =>
  action(FUZZY + SEARCH_KEY_UPDATE, 'keys', value);
export const resetSettings = () => action(SETTINGS_RESET);
export const updateKeybinding = (key, command) =>
  action(KEYBINDING_UPDATE, key, command);
export const updateSecondaryKeybinding = (key, command) =>
  action(SECONDARY_KEYBINDING_UPDATE, key, command);
export const removeSecondaryKeybinding = (key) =>
  action(SECONDARY_KEYBINDING_REMOVE, key);
export const resetKeyboardToDefaults = () => action(KEYBINDING_DEFAULT_RESET);
export const resetSetting = (key) =>
  action(SETTING_RESET, inputReducerMap[key]);
export const updateColor = (k, v) => action(COLOR_UPDATE, k, v);
