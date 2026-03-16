import {
  TAB_DELETE,
  TAB_OPEN,
  TAB_REFRESH,
  TAB_PIN,
  URL_COPY,
  DUPLICATE_TAB_DELETE,
  MUTE_TOGGLE,
} from 'core/keyboard';
import { kbdCommandToString } from 'core/keyboard/to-string';
import { navigateResults } from './utils/keyboard';
import {
  TAB_TYPE,
  OTHER_WINDOW_TAB_TYPE,
  SESSION_TYPE,
  BOOKMARK_TYPE,
  HISTORY_TYPE,
  TAB_PIN_CLASSNAME,
  TAB_MUTED_CLASSNAME,
} from './constants';

const MENU_SELECTOR = '.context-menu';

let menuEl = null;
let currentTabNode = null;
let getStateFn = null;

// Returns whether the context menu is currently visible
export function isContextMenuOpen() {
  return menuEl !== null && !menuEl.hidden;
}

// Returns the list of menu items for a given tab node
function getActionsForTab(tabNode, keyboardState) {
  const { type } = tabNode.dataset;
  const isRegularTab = type === TAB_TYPE || type === OTHER_WINDOW_TAB_TYPE;
  const isPinned = tabNode.classList.contains(TAB_PIN_CLASSNAME);
  const isMuted = tabNode.classList.contains(TAB_MUTED_CLASSNAME);

  const shortcutText = (actionKey) => {
    const binding = keyboardState[actionKey];
    if (!binding || !binding.command) return '';
    return kbdCommandToString(binding.command);
  };

  const actions = [];

  if (isRegularTab) {
    actions.push(
      { label: 'Switch to Tab', action: TAB_OPEN, shortcut: shortcutText(TAB_OPEN) },
      { separator: true },
      { label: isPinned ? 'Unpin Tab' : 'Pin Tab', action: TAB_PIN, shortcut: shortcutText(TAB_PIN) },
      { label: isMuted ? 'Unmute Tab' : 'Mute Tab', action: MUTE_TOGGLE, shortcut: shortcutText(MUTE_TOGGLE) },
      { label: 'Refresh', action: TAB_REFRESH, shortcut: shortcutText(TAB_REFRESH) },
      { label: 'Copy URL', action: URL_COPY, shortcut: shortcutText(URL_COPY) },
      { separator: true },
      { label: 'Close Tab', action: TAB_DELETE, shortcut: shortcutText(TAB_DELETE), destructive: true },
      { label: 'Delete Duplicates', action: DUPLICATE_TAB_DELETE, shortcut: shortcutText(DUPLICATE_TAB_DELETE), destructive: true },
    );
  } else if (type === SESSION_TYPE) {
    actions.push(
      { label: 'Restore Tab', action: TAB_OPEN, shortcut: shortcutText(TAB_OPEN) },
      { label: 'Copy URL', action: URL_COPY, shortcut: shortcutText(URL_COPY) },
    );
  } else if (type === BOOKMARK_TYPE) {
    actions.push(
      { label: 'Open Bookmark', action: TAB_OPEN, shortcut: shortcutText(TAB_OPEN) },
      { label: 'Copy URL', action: URL_COPY, shortcut: shortcutText(URL_COPY) },
    );
  } else if (type === HISTORY_TYPE) {
    actions.push(
      { label: 'Open Page', action: TAB_OPEN, shortcut: shortcutText(TAB_OPEN) },
      { label: 'Copy URL', action: URL_COPY, shortcut: shortcutText(URL_COPY) },
    );
  }

  return actions;
}

// Render menu items into the menu element
function renderMenu(actions) {
  menuEl.innerHTML = '';
  actions.forEach((item) => {
    if (item.separator) {
      const sep = document.createElement('div');
      sep.className = 'context-menu__separator';
      menuEl.appendChild(sep);
      return;
    }
    const el = document.createElement('div');
    el.className = 'context-menu__item';
    if (item.destructive) {
      el.classList.add('context-menu__item--destructive');
    }
    el.dataset.action = item.action;

    const label = document.createElement('span');
    label.textContent = item.label;
    el.appendChild(label);

    if (item.shortcut) {
      const hint = document.createElement('span');
      hint.className = 'context-menu__shortcut';
      hint.textContent = item.shortcut;
      el.appendChild(hint);
    }

    el.addEventListener('click', handleMenuItemClick);
    menuEl.appendChild(el);
  });
}

// Position the menu within the popup viewport
function positionMenu(x, y) {
  // Temporarily show off-screen to measure
  menuEl.style.left = '0px';
  menuEl.style.top = '0px';
  menuEl.hidden = false;

  const menuRect = menuEl.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;

  let left = x;
  let top = y;

  // Flip left if overflowing right
  if (left + menuRect.width > viewportWidth) {
    left = x - menuRect.width;
  }
  // Flip up if overflowing bottom
  if (top + menuRect.height > viewportHeight) {
    top = y - menuRect.height;
  }

  // Clamp to viewport edges
  left = Math.max(0, left);
  top = Math.max(0, top);

  menuEl.style.left = `${left}px`;
  menuEl.style.top = `${top}px`;
}

function openMenu(tabNode, x, y) {
  const state = getStateFn();
  const actions = getActionsForTab(tabNode, state.keyboard);
  if (actions.length === 0) return;

  currentTabNode = tabNode;
  // Focus the tab node so keyboard actions target it
  tabNode.focus();

  renderMenu(actions);
  positionMenu(x, y);
}

export function closeMenu() {
  if (!menuEl) return;
  menuEl.hidden = true;
  menuEl.innerHTML = '';
  currentTabNode = null;
}

// Execute the action associated with a menu item click
function handleMenuItemClick(event) {
  const actionKey = event.currentTarget.dataset.action;
  if (!actionKey || !currentTabNode) return;

  // Focus the tab so navigateResults targets it
  currentTabNode.focus();
  closeMenu();

  navigateResults(actionKey, getStateFn);
}

// Handle contextmenu event on the tab list
function handleContextMenu(event) {
  const tabNode = event.target.closest('.tab-object');
  if (!tabNode) return; // Not on a tab row — let native menu through

  event.preventDefault();
  closeMenu();
  openMenu(tabNode, event.clientX, event.clientY);
}

// Dismiss handlers
function handleDocumentClick(event) {
  if (!isContextMenuOpen()) return;
  if (menuEl.contains(event.target)) return;
  closeMenu();
}

function handleKeyDown(event) {
  if (!isContextMenuOpen()) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    closeMenu();
  }
}

function handleScroll() {
  if (isContextMenuOpen()) {
    closeMenu();
  }
}

// Initialize the context menu system
export function initContextMenu(store) {
  menuEl = document.querySelector(MENU_SELECTOR);
  getStateFn = store.getState;

  const tabListEl = document.querySelector('.tab-list');
  tabListEl.addEventListener('contextmenu', handleContextMenu);
  tabListEl.addEventListener('scroll', handleScroll);

  // Use capture for Escape so we intercept before the keydown handler
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('click', handleDocumentClick, true);

  return store;
}
