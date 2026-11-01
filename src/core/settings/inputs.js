// What the settings page shows in each setting input, and what a change to
// one means. Inputs are plain values: { name, type, value, checked, min, max }
import reducerMap from './inputs-to-reducer';
import {
  updateFuzzyThresholdRange,
  updateCheckbox,
  updateFuzzyCheckbox,
  updateFuzzySearchKeys,
  updateNumber,
  resetSetting,
  updateColor,
  updateSelect,
} from './actions';
import {
  MRU_SORT,
  MRU_POPUP_KEY,
  MRU_ALL_KEY,
  mruChoice,
  mruSettings,
} from './mru';
import { findSetting } from './lookup';

// Settings that need an optional permission before they can turn on
const PERMISSION_SETTINGS = { showBookmarks: 'bookmarks', showHistory: 'history' };

export const isSettingInput = name => name in reducerMap || name === MRU_SORT;

// The stored value an input shows: { checked } or { value }, or null to
// leave the input as it is
export function inputDisplay({ name, type, value: inputValue }, settings) {
  if (name === MRU_SORT) {
    return { checked: inputValue === mruChoice(settings.general || {}) };
  }
  const value = findSetting(settings, reducerMap[name]);
  if (value === undefined) return null;
  switch (type) {
    case 'checkbox':
      // showUrls is stored as the list of keys to search in; only 'url'
      // can come and go
      return { checked: Array.isArray(value) ? value.includes('url') : value };
    case 'radio':
      return { checked: inputValue === value };
    case 'range':
      return { value: Math.round(value * 10) };
    case 'number':
    case 'color':
      return { value };
    default:
      return null;
  }
}

// A typed number kept within the input's limits, or null when it isn't one
export function clampNumber(value, min, max) {
  const number = parseInt(value, 10);
  if (Number.isNaN(number)) return null;
  return Math.min(Number(max), Math.max(Number(min), number));
}

function checkboxChange(name, key, reducer, checked) {
  if (name in PERMISSION_SETTINGS) {
    return checked
      ? { requestPermission: PERMISSION_SETTINGS[name], onGrant: [updateCheckbox(name, true)] }
      : { dispatch: [updateCheckbox(name, false)] };
  }
  if (key === 'keys') return { dispatch: [updateFuzzySearchKeys(checked)] };
  if (reducer === 'fuzzy') return { dispatch: [updateFuzzyCheckbox(key, checked)] };
  return { dispatch: [updateCheckbox(key, checked)] };
}

// What a changed input does. One of:
//   { dispatch: [action, ...] }
//   { requestPermission, onGrant: [action, ...] }  uncheck it if denied
//   { value, dispatch: [action, ...] }  show the clamped value
//   { restore: true }  the number was emptied: show the stored value again
export function settingChange({
  name, type, value, checked, min, max,
}) {
  if (name === MRU_SORT) {
    const settings = mruSettings(value);
    return { dispatch: Object.keys(settings).map(key => updateCheckbox(key, settings[key])) };
  }
  const [reducer, key] = reducerMap[name].split('.');
  switch (type) {
    case 'range':
      return { dispatch: [updateFuzzyThresholdRange(parseInt(value, 10))] };
    case 'checkbox':
      return checkboxChange(name, key, reducer, checked);
    case 'number': {
      const clamped = clampNumber(value, min, max);
      return clamped === null
        ? { restore: true }
        : { value: clamped, dispatch: [updateNumber(key, clamped)] };
    }
    case 'color':
      return { dispatch: [updateColor(key, value)] };
    case 'radio':
      return { dispatch: checked ? [updateSelect(key, value)] : [] };
    default:
      return { dispatch: [] };
  }
}

// The reset actions for a section's inputs, by input name
export function resetActions(names) {
  return [...new Set(names)]
    .flatMap(name => (name === MRU_SORT ? [MRU_POPUP_KEY, MRU_ALL_KEY] : [name]))
    .map(resetSetting);
}

// Whether a stepper button that steps by `step` can't go any further
export function atStepLimit(step, value, min, max) {
  return Number(step) < 0 ? Number(value) <= Number(min) : Number(value) >= Number(max);
}
