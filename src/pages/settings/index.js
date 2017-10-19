import { createUIStore } from 'redux-webext';
import inputMap from './inputs-to-reducer';
import * as actions from './actions';

// Object containing input ids and their corresponding nodes
const inputs = [...document.querySelectorAll('input')]
  .reduce((acc, node) => Object.assign({}, acc, { [node.id]: node }), {});
// Given the setting object and the location we want to search, return the
// current setting value
// e.g. 'fuzzySearch.enableFuzzySearch' -> settings.fuzzySearch.enableFuzzySearch
function findSetting(settings, location) {
  const locationSplit = location.split('.');
  const hasDepth = locationSplit.length > 1;
  if (hasDepth) {
    const walkObject = (acc, key) => acc[key];
    return locationSplit.reduce(walkObject, settings);
  }
  return settings[location];
}

function getStateSettings(settings) {
  return function fillStateSettings(node) {
    const { id, type } = node;
    const stateSettingValue = findSetting(settings, inputMap[id]);
    switch (type) {
      case 'checkbox':
        if (typeof stateSettingValue === 'boolean') {
          node.checked = stateSettingValue;
        } else if (Array.isArray(stateSettingValue)) {
          // If here this is the showUrls options, the state only stores an
          // an array of keys we're allowed to search in. The only thing
          // we can change is whether the 'url' value is present in the array
          node.checked = stateSettingValue.includes('url');
        }
        break;
      case 'range':
        node.value = stateSettingValue * 10;
        break;
      default: break;
    }
  };
}


function configureEventListeners(dispatch) {
  return function attachEventListeners(node) {
    node.addEventListener('change', (event) => {
      // Figure out which action to dispatch based on the node's props
      const {
        id,
        type,
        value,
        checked,
      } = event.currentTarget;
      if (type === 'range') {
        dispatch(actions.updateFuzzyThresholdRange(parseInt(value, 10)));
        return;
      }
      // Should be boolean if here
      // Get the location of the key in our state
      const settingsLocation = inputMap[id].split('.');
      const settingKey = settingsLocation[settingsLocation.length - 1];
      if (settingsLocation[0] === 'fuzzy' && settingKey !== 'keys') {
        dispatch(actions.updateFuzzyCheckbox(settingKey, checked));
      } else if (settingKey === 'keys') {
        dispatch(actions.updateFuzzySearchKeys(checked));
      } else {
        dispatch(actions.updateCheckbox(settingKey, checked));
      }
    });
  };
}

createUIStore().then((store) => {
  const { dispatch } = store;
  const settings = store.getState();
  const fillStateSettings = getStateSettings(settings);
  Object.values(inputs).forEach(fillStateSettings);
  Object.values(inputs).forEach(configureEventListeners(dispatch));
  document.getElementById('reset-defaults').addEventListener('click', () => {
    dispatch(actions.resetSettings());
    location.reload(true);
  });
  return store;
}).catch((e) => {
  throw e;
});
