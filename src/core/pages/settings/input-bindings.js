// Bindings:

// ShowRecentlyClosedTab -> disables limit if false

// showRecentlyClosedTab -> disables alwaysShowRecentlyClosedAtTheBottom

// enableFuzzySearch -> disables showUrls

// enableFuzzySearch -> disables threshold

// { [inputId] -> [input ids to disable if false]}
const d = document;
const disableBindings = {
  showRecentlyClosed: [
    'recentlyClosedLimit',
    'alwaysShowRecentlyClosedAtTheBottom',
  ],
  enableFuzzySearch: ['threshold', 'shouldSort'],
  shouldSortByMostRecentlyUsedOnPopup: ['shouldSortByMostRecentlyUsedAll'],
};
const mirrorBindings = {
  threshold: 'thresholdDisplay',
};

export default function addInputBindings() {
  // TODO: both binding operations could be condensed into a few functions

  // Disable/Enable bindings
  Object.keys(disableBindings).forEach((masterId) => {
    // Attach an onchange handler that checks for the value
    // enables dependent inputs if value is true
    // disables dependent inputs if value is false
    d.getElementById(masterId).addEventListener('change', (event) => {
      const { checked } = event.currentTarget;
      const dependents = disableBindings[masterId];
      dependents.forEach((dependentId) => {
        const dependent = d.getElementById(dependentId);
        dependent.disabled = !checked;
        const label = d.querySelector(`label[for=${dependentId}]`);
        if (!checked) {
          dependent.checked = false;
          dependent.dispatchEvent(new Event('change'));
          label.classList.add('disabled-label');
        } else {
          label.classList.remove('disabled-label');
        }
      });
    });
  });

  // Mirror bindings
  Object.keys(mirrorBindings).forEach((masterId) => {
    const master = d.getElementById(masterId);
    const dependentId = mirrorBindings[masterId];
    const dependent = d.getElementById(dependentId);
    dependent.value = master.value;
    master.addEventListener('change', (event) => {
      const { value } = event.currentTarget;
      dependent.value = value;
    });

    dependent.addEventListener('change', (event) => {
      const { value } = event.currentTarget;
      master.value = value;
    });
  });
}
