import { TAB_MENU_ITEMS } from 'core/tab-menu';
import { navigateResults } from './utils/keyboard';
import { TAB_TYPE, OTHER_WINDOW_TAB_TYPE, BOOKMARK_TYPE } from './constants';

// The result row that the open tab menu belongs to
let menuRow = null;

// Firefox only: right-clicking a result shows the tab (or bookmark) context
// menu, with other add-ons' items, instead of the popup page's menu
export function overrideResultContextMenu(event) {
  // Chrome has no menus.overrideContext()
  if (!browser.menus?.overrideContext) return;
  menuRow = null;
  const node = event.target.closest('.tab-object');
  if (!node) return;
  const { id, type } = node.dataset;
  switch (type) {
    case TAB_TYPE:
    case OTHER_WINDOW_TAB_TYPE:
      menuRow = node;
      browser.menus.overrideContext({ context: 'tab', tabId: parseInt(id, 10) });
      break;
    case BOOKMARK_TYPE:
      browser.menus.overrideContext({ context: 'bookmark', bookmarkId: id });
      break;
    default: break;
  }
}

// Pin and Mute say what a click will do, like the real tab menu
export function updateMenuTitles(info, tab) {
  if (!info.contexts.includes('tab') || !menuRow || !tab) return null;
  return Promise.all([
    browser.menus.update('tab-pin', { title: tab.pinned ? 'Unpin Tab' : 'Pin Tab' }),
    browser.menus.update('tab-mute', { title: tab.mutedInfo.muted ? 'Unmute Tab' : 'Mute Tab' }),
  ]).then(() => browser.menus.refresh());
}

// Runs the item as its keyboard command on the menu row, so the row updates
export function runMenuItem(info, getState) {
  const item = TAB_MENU_ITEMS.find(({ id }) => id === info.menuItemId);
  if (!item || !menuRow) return;
  menuRow.focus();
  navigateResults(item.command, getState);
}
