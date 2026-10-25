import 'core/polyfill';
import { initialColorSettings as initialColors } from 'core/reducers/defaults';
import { rehydrated } from 'core/store';
import { setBadgeBackgroundColor } from 'core/utils/action-api';
import { createTabMenuItems } from 'core/tab-menu';
import backgroundStore from './store';
import {
  addBadgeTextListeners,
  startCountingBadgeText,
  stopCountingBadgeText,
} from './badge-text-listeners';
import { createSessionFlag, watchBadgeTextSetting } from './badge-text-state';

// Init background
// Tab listeners must be added in the first turn so a stopped MV3 service
// worker is woken for them; they wait for the saved setting before counting.
addBadgeTextListeners(() => rehydrated
  .then(() => backgroundStore.getState().general.showTabCountBadgeText));

watchBadgeTextSetting({
  store: backgroundStore,
  rehydrated,
  countedThisSession: createSessionFlag('badgeTextCounted'),
  startCounting: startCountingBadgeText,
  stopCounting: stopCountingBadgeText,
  setBadgeBackgroundColor,
  defaultColor: initialColors.popupBadgeColor,
});

// Firefox only: TabSearch's items in the tab menu of a result
createTabMenuItems();
