import 'core/polyfill';
import { initialColorSettings as initialColors } from 'core/reducers/defaults';
import { rehydrated } from 'core/store';
import { setBadgeBackgroundColor } from 'core/utils/action-api';
import backgroundStore from './store';
import {
  addBadgeTextListeners,
  startCountingBadgeText,
  stopCountingBadgeText,
} from './badge-text-listeners';

// Init background
// Tab listeners must be added in the first turn so a stopped MV3 service
// worker is woken for them; they wait for the saved setting before counting.
addBadgeTextListeners(() => rehydrated
  .then(() => backgroundStore.getState().general.showTabCountBadgeText));
backgroundStore.subscribe(subscribeToBadgeTextState(backgroundStore));

function subscribeToBadgeTextState(store) {
  // Don't need to set anything initially, a REHYDRATE action will be dispatched
  // initially to grab the saved setting, which means the initial badge count
  // will be handled by the func below anyway
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
      startCountingBadgeText();
    } else {
      stopCountingBadgeText();
    }
    const shouldUpdateBadgeColor = nextState.color.popupBadgeColor !== prevState.color.popupBadgeColor
      && showTabCountBadgeText;
    if (shouldUpdateBadgeColor) {
      setBadgeBackgroundColor({
        color: nextState.color.popupBadgeColor,
      });
    }
    prevState = nextState;
  };
}
