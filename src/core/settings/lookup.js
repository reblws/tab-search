// Given the setting object and the location we want to search, return the
// current setting value
// e.g. 'fuzzy.enableFuzzySearch' -> settings.fuzzy.enableFuzzySearch
export function findSetting(settings, location) {
  return location.split('.').reduce((acc, key) => acc?.[key], settings);
}

// The parts of the state the popup reads; keyboard shortcuts don't show
const popupState = ({ general, fuzzy, color, state }) =>
  JSON.stringify({ general, fuzzy, color, state });

export function popupStateChanged(prev, next) {
  return popupState(prev) !== popupState(next);
}
