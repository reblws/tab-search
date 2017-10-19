import backgroundStore from './store';
import {
  startCountingBadgeTextAndAddListeners,
  stopCountingBadgeTextAndRemoveListeners,
} from './badge-text-listeners';

// Init background
// First check if we even want to check for badge text, if true then start a
// timeout to wait for the browser to start up and add call startCounting...
const { getState } = backgroundStore;

if (getState().general.showTabCountBadgeText) {
  const LOADING_TEXT = '...';
  // Show loading indicator
  browser.browserAction.setBadgeText({
    text: LOADING_TEXT,
  });
  setTimeout(() => startCountingBadgeTextAndAddListeners(), 1000);
}

backgroundStore.subscribe(subscribeToBadgeTextState(backgroundStore));

function subscribeToBadgeTextState(store) {
  let prevValue = store.getState().general.showTabCountBadgeText;
  return () => {
    const nextValue = store.getState().general.showTabCountBadgeText;
    // These should only run if the setting actually changed
    // If the initial prevValue is already true we dont need to add these
    // listeners
    if (nextValue && !prevValue) {
      startCountingBadgeTextAndAddListeners();
    } else if (!nextValue && prevValue) {
      stopCountingBadgeTextAndRemoveListeners();
    }
    prevValue = nextValue;
  };
}

