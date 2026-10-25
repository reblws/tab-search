import { TAB_MENU_ITEMS } from 'core/tabs/menu-items';

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
