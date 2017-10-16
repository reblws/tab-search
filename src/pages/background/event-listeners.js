import { initializeTabs } from '../../actions/tabs';

export default function addBackgroundListeners(dispatch) {
  const updateTabs = () => {
    dispatch(initializeTabs());
  };
  const events = [
    browser.tabs.onCreated,
    browser.tabs.onRemoved,
    browser.tabs.onReplaced,
    browser.tabs.onUpdated,
  ];
  // Repopulate the tabs object every time a tab is modified.
  events.forEach((event) => {
    event.addListener(updateTabs);
  });
}
