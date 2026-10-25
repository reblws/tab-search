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
  MRU_NEVER,
  MRU_POPUP,
  MRU_ALWAYS,
  MRU_POPUP_KEY,
  MRU_ALL_KEY,
} from './constants';

// The two most-recently-used booleans are one three-way choice on the page.
// The popup sorts by MRU before typing when only the first is on, and always
// when both are.
export function mruChoice({ [MRU_POPUP_KEY]: onPopup, [MRU_ALL_KEY]: all }) {
  if (onPopup && all) return MRU_ALWAYS;
  if (onPopup) return MRU_POPUP;
  return MRU_NEVER;
}

export function mruSettings(choice) {
  return {
    [MRU_POPUP_KEY]: choice !== MRU_NEVER,
    [MRU_ALL_KEY]: choice === MRU_ALWAYS,
  };
}

// Setting inputs on the page, grouped by name (radio groups share one)
function findInputs(root) {
  return [...root.querySelectorAll('input[name]')]
    .filter(({ name }) => name in reducerMap || name === MRU_SORT);
}

// Given the setting object and the location we want to search, return the
// current setting value
// e.g. 'fuzzy.enableFuzzySearch' -> settings.fuzzy.enableFuzzySearch
function findSetting(settings, location) {
  return location.split('.').reduce((acc, key) => acc?.[key], settings);
}

// Shows a setting's stored value in its input without dispatching anything
function fillInput(node, settings) {
  const { name, type } = node;
  if (name === MRU_SORT) {
    node.checked = node.value === mruChoice(settings.general || {});
    return;
  }
  const value = findSetting(settings, reducerMap[name]);
  if (value === undefined) return;
  switch (type) {
    case 'checkbox':
      // showUrls is stored as the list of keys to search in; only 'url'
      // can come and go
      node.checked = Array.isArray(value) ? value.includes('url') : value;
      break;
    case 'radio':
      node.checked = node.value === value;
      break;
    case 'range':
      node.value = Math.round(value * 10);
      break;
    case 'number':
      // Don't fight someone typing in it
      if (document.activeElement !== node) node.value = value;
      break;
    case 'color':
      node.value = value;
      break;
    default: break;
  }
}

function clamp(node) {
  const value = parseInt(node.value, 10);
  if (Number.isNaN(value)) return null;
  return Math.min(Number(node.max), Math.max(Number(node.min), value));
}

// Decides which action to dispatch for an input that changed
function settingChangeHandler(dispatch, getState) {
  return function onChange(event) {
    const node = event.currentTarget;
    const { name, type, value, checked } = node;
    if (name === MRU_SORT) {
      const settings = mruSettings(value);
      Object.keys(settings).forEach((key) => {
        dispatch(updateCheckbox(key, settings[key]));
      });
      return;
    }
    const [reducer, key] = reducerMap[name].split('.');
    switch (type) {
      case 'range':
        dispatch(updateFuzzyThresholdRange(parseInt(value, 10)));
        break;
      case 'checkbox':
        if (name === 'showBookmarks' || name === 'showHistory') {
          if (!checked) {
            dispatch(updateCheckbox(name, false));
            break;
          }
          const permission = name.slice('show'.length).toLowerCase();
          browser.permissions.request({ permissions: [permission] })
            .then((granted) => {
              if (granted) {
                dispatch(updateCheckbox(name, true));
              } else {
                node.checked = false;
              }
            });
        } else if (key === 'keys') {
          dispatch(updateFuzzySearchKeys(checked));
        } else if (reducer === 'fuzzy') {
          dispatch(updateFuzzyCheckbox(key, checked));
        } else {
          dispatch(updateCheckbox(key, checked));
        }
        break;
      case 'number': {
        const clamped = clamp(node);
        if (clamped === null) {
          // Emptied: show the stored value again
          fillInput(node, getState());
        } else {
          node.value = clamped;
          dispatch(updateNumber(key, clamped));
        }
        break;
      }
      case 'color':
        dispatch(updateColor(key, value));
        break;
      case 'radio':
        if (checked) dispatch(updateSelect(key, value));
        break;
      default: break;
    }
  };
}

// Rows marked data-depends-on="<checkbox id>" are greyed out and disabled
// while that checkbox is off. Their values are kept.
function updateDependents(root) {
  root.querySelectorAll('[data-depends-on]').forEach((row) => {
    const parent = document.getElementById(row.dataset.dependsOn);
    const enabled = !parent || parent.checked;
    row.classList.toggle('is-disabled', !enabled);
    row.querySelectorAll('input, button').forEach((control) => {
      control.disabled = !enabled;
    });
  });
}

function updateDerivedText(root) {
  const threshold = root.querySelector('#threshold');
  const output = root.querySelector('#threshold-value');
  if (threshold && output) {
    output.textContent = (threshold.value / 10).toFixed(1);
  }
  root.querySelectorAll('[data-hex-for]').forEach((node) => {
    const input = document.getElementById(node.dataset.hexFor);
    if (input) node.textContent = input.value;
  });
  root.querySelectorAll('.stepper').forEach(updateStepperButtons);
}

function updateStepperButtons(stepper) {
  const input = stepper.querySelector('input');
  const value = Number(input.value);
  stepper.querySelectorAll('[data-step]').forEach((button) => {
    const atLimit = Number(button.dataset.step) < 0
      ? value <= Number(input.min)
      : value >= Number(input.max);
    button.disabled = input.disabled || atLimit;
  });
}

function initSteppers(root) {
  root.querySelectorAll('.stepper').forEach((stepper) => {
    const input = stepper.querySelector('input');
    stepper.querySelectorAll('[data-step]').forEach((button) => {
      button.addEventListener('click', () => {
        if (Number(button.dataset.step) < 0) {
          input.stepDown();
        } else {
          input.stepUp();
        }
        input.dispatchEvent(new Event('change'));
      });
    });
  });
}

// Each section's Reset button resets the settings inside it
function initResetButtons(root, dispatch) {
  root.querySelectorAll('[data-reset]').forEach((button) => {
    const section = button.closest('section');
    button.addEventListener('click', () => {
      const names = new Set(findInputs(section).map(({ name }) => name));
      names.forEach((name) => {
        const keys = name === MRU_SORT ? [MRU_POPUP_KEY, MRU_ALL_KEY] : [name];
        keys.forEach(key => dispatch(resetSetting(key)));
      });
    });
  });
}

export function initSettings(store, root = document) {
  const { dispatch, getState, subscribe } = store;
  const inputs = findInputs(root);
  const render = () => {
    const settings = getState();
    inputs.forEach(node => fillInput(node, settings));
    updateDependents(root);
    updateDerivedText(root);
  };

  render();
  const onChange = settingChangeHandler(dispatch, getState);
  inputs.forEach((node) => {
    node.addEventListener('change', onChange);
    node.addEventListener('change', () => {
      updateDependents(root);
      updateDerivedText(root);
    });
    node.addEventListener('input', () => updateDerivedText(root));
  });
  initSteppers(root);
  initResetButtons(root, dispatch);
  // Follows resets and changes made in other windows
  if (subscribe) subscribe(render);
}
