import {
  isSettingInput,
  inputDisplay,
  settingChange,
  resetActions,
  atStepLimit,
} from 'core/settings/inputs';

// Setting inputs on the page, grouped by name (radio groups share one)
function findInputs(root) {
  return [...root.querySelectorAll('input[name]')].filter(({ name }) => isSettingInput(name));
}

const inputValues = ({ name, type, value, checked, min, max }) =>
  ({ name, type, value, checked, min, max });

// Shows a setting's stored value in its input without dispatching anything
function fillInput(node, settings) {
  const shown = inputDisplay(inputValues(node), settings);
  if (!shown) return;
  if ('checked' in shown) {
    node.checked = shown.checked;
  } else if (!(node.type === 'number' && document.activeElement === node)) {
    // Don't fight someone typing in a number
    node.value = shown.value;
  }
}

// Carries out what core/settings/inputs.js's settingChange says
function settingChangeHandler(dispatch, getState) {
  return function onChange(event) {
    const node = event.currentTarget;
    const change = settingChange(inputValues(node));
    if (change.restore) {
      fillInput(node, getState());
      return;
    }
    if (change.value !== undefined) node.value = change.value;
    if (change.requestPermission) {
      browser.permissions.request({ permissions: [change.requestPermission] })
        .then((granted) => {
          if (granted) {
            change.onGrant.forEach(dispatch);
          } else {
            node.checked = false;
          }
        });
      return;
    }
    change.dispatch.forEach(dispatch);
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
  const size = root.querySelector('input[name="popupSize"]:checked');
  const sizeValue = root.querySelector('#popupSize-value');
  if (size && sizeValue) {
    sizeValue.textContent = size.dataset.width;
  }
  root.querySelectorAll('[data-hex-for]').forEach((node) => {
    const input = document.getElementById(node.dataset.hexFor);
    if (input) node.textContent = input.value;
  });
  root.querySelectorAll('.stepper').forEach(updateStepperButtons);
}

function updateStepperButtons(stepper) {
  const input = stepper.querySelector('input');
  stepper.querySelectorAll('[data-step]').forEach((button) => {
    button.disabled = input.disabled
      || atStepLimit(button.dataset.step, input.value, input.min, input.max);
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
      resetActions(findInputs(section).map(({ name }) => name)).forEach(dispatch);
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
