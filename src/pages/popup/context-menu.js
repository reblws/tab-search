import { TAB_MENU_ITEMS, menuContext, menuTitles } from 'core/tabs/menu-items';
import { navigateResults } from './commands';

// The result row that the open tab menu belongs to
let menuRow = null;

// Firefox only: right-clicking a result shows the tab (or bookmark) context
// menu, with other add-ons' items, instead of the popup page's menu
export function overrideResultContextMenu(event) {
  // Chrome has no menus.overrideContext()
  if (!browser.menus?.overrideContext) return;
  const node = event.target.closest('.tab-object');
  const context = node && menuContext(node.dataset);
  // Only the tab menu has TabSearch's items, which act on this row
  menuRow = context && context.context === 'tab' ? node : null;
  if (context) browser.menus.overrideContext(context);
}

export function updateMenuTitles(info, tab) {
  if (!info.contexts.includes('tab') || !menuRow || !tab) return null;
  const titles = menuTitles(tab);
  return Promise.all(Object.keys(titles)
    .map(id => browser.menus.update(id, { title: titles[id] })))
    .then(() => browser.menus.refresh());
}

// Runs the item as its keyboard command on the menu row, so the row updates
export function runMenuItem(info, getState) {
  const item = TAB_MENU_ITEMS.find(({ id }) => id === info.menuItemId);
  if (!item || !menuRow) return;
  menuRow.focus();
  navigateResults(item.command, getState);
}
