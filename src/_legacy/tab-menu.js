import {
  TAB_REFRESH,
  TAB_PIN,
  MUTE_TOGGLE,
  TAB_DELETE,
} from 'core/keyboard/constants';

// TabSearch's own items in the tab menu that a result opens (Firefox only).
// Each one runs the popup keyboard command of the same name
export const TAB_MENU_ITEMS = [
  { id: 'tab-reload', title: 'Reload Tab', command: TAB_REFRESH },
  { id: 'tab-pin', title: 'Pin Tab', command: TAB_PIN },
  { id: 'tab-mute', title: 'Mute Tab', command: MUTE_TOGGLE },
  { id: 'tab-close', title: 'Close Tab', command: TAB_DELETE },
];

// Persistent MV2 background pages don't keep menu items, so this runs on
// every start. viewTypes keeps the items off the real tab strip
export function createTabMenuItems() {
  if (!browser.menus) return;
  TAB_MENU_ITEMS.forEach(({ id, title }) => {
    browser.menus.create({
      id,
      title,
      contexts: ['tab'],
      viewTypes: ['popup'],
    });
  });
}
