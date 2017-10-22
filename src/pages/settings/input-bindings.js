// Bindings:

// ShowRecentlyClosedTab -> disables limit if false

// showRecentlyClosedTab -> disables alwaysShowRecentlyClosedAtTheBottom

// enableFuzzySearch -> disables showUrls

// enableFuzzySearch -> disables threshold

// { [inputId] -> [input ids to disable if false]}
const d = document;
const disableBindings = {
  showRecentlyClosed: ['recentlyClosedLimit', 'alwaysShowRecentlyClosedAtTheBottom'],
  enableFuzzySearch: ['threshold', 'shouldSort'],
};

export default function addInputBindings() {
  Object.keys(disableBindings).forEach((masterId) => {
    // Attach an onchange handler that checks for the value
    d.getElementById(masterId).addEventListener('change', (event) => {
      const { checked } = event.currentTarget;
      const dependents = disableBindings[masterId];
      dependents.forEach((dependentId) => {
        const dependent = d.getElementById(dependentId);
        // Don't need strict compare
        // eslint-disable-next-line eqeqeq
        dependent.disabled = !checked;
        const label = d.querySelector(`label[for=${dependentId}]`);
        if (!checked) {
          label.classList.add('disabled-label');
        } else {
          label.classList.remove('disabled-label');
        }
      });
    });
    // enables dependent inputs if value is true
    // disables dependent inputs if value is false
  });
}
