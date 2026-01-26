import { initialColorSettings as initialColors } from 'core/reducers/defaults';
import { setBadgeBackgroundColor } from 'core/utils/action-api';
import backgroundStore from './store';
import {
  startCountingBadgeTextAndAddListeners,
  stopCountingBadgeTextAndRemoveListeners,
} from './badge-text-listeners';

// Init background
// First check if we even want to check for badge text, if true then start a
// timeout to wait for the browser to start up and add call startCounting...
backgroundStore.subscribe(subscribeToBadgeTextState(backgroundStore));

function subscribeToBadgeTextState(store) {
  // Don't need to set anything initially, a REHYDRATE action will be dispatched
  // initially to grab the saved setting, which means the initial adding of
  // listeners will be handled by the func below anyway
  let prevState = store.getState();
  if (prevState.color.popupBadgeColor !== initialColors.popupBadgeColor) {
    setBadgeBackgroundColor({
      color: prevState.color.popupBadgeColor,
    });
  }
  return () => {
    const nextState = store.getState();
    const { showTabCountBadgeText } = nextState.general;
    if (showTabCountBadgeText) {
      startCountingBadgeTextAndAddListeners();
    } else {
      stopCountingBadgeTextAndRemoveListeners();
    }
    const shouldUpdateBadgeColor =
      nextState.color.popupBadgeColor !== prevState.color.popupBadgeColor &&
      showTabCountBadgeText;
    if (shouldUpdateBadgeColor) {
      setBadgeBackgroundColor({
        color: nextState.color.popupBadgeColor,
      });
    }
    prevState = nextState;
  };
}
