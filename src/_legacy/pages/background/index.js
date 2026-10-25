import 'shell/platform/polyfill';
import { initialColorSettings as initialColors } from 'core/reducers/defaults';
import { rehydrated } from 'shell/store/create-store';
import { setBadgeBackgroundColor } from 'shell/platform/action-api';
import { createTabMenuItems } from 'shell/platform/tab-menu';
import backgroundStore from './store';
import {
  addBadgeTextListeners,
  startCountingBadgeText,
  stopCountingBadgeText,
} from './badge-text-listeners';
import { createSessionFlag } from 'shell/storage/session-flag';
import { watchBadgeTextSetting } from './badge-text-state';
import { addTabRecencyListeners, createFocusRecord } from './tab-recency';

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

// Tab focus times for the most recently used sort (reblws/tab-search#114)
addTabRecencyListeners(createFocusRecord());

// Firefox only: TabSearch's items in the tab menu of a result
createTabMenuItems();
