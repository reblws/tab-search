import debounce from 'debounce';
import { changedTypeColors } from 'core/results/colors';
import { POPUP_SIZE_PRESETS, OVERLAY_SCROLLBAR_CLASSNAME } from './classnames';
import {
  searchInput,
  deleteButton,
  prefsBtn,
  tabList,
} from './nodes';
import {
  scrollIfNeeded,
  populateTabList,
  overrideFontStylesWithSansSerif,
  appendSearchInputPlaceholderText,
  setStyleSheetRule,
} from './render';
import {
  addTabCacheListeners,
  removeTabCacheListeners,
} from 'shell/cache/tab-cache';
import { getOsShortcut } from 'shell/platform/os';
import { createTab } from 'shell/platform/tabs';
import {
  keydownHandler,
  configureSearch,
  clearInput,
  handleTabClick,
  updateLastQueryOnKeydown,
} from './events';
import {
  overrideResultContextMenu,
  updateMenuTitles,
  runMenuItem,
} from './context-menu';
import { surface, closeUI } from './surface';
import { renderOverlayHints } from './overlay-hints';

function openSettingsPage() {
  createTab({
    url: browser.runtime.getURL('../settings/index.html'),
    active: true,
  }).then(closeUI);
}

export function applyPopupSize(store) {
  const { popupSize } = store.getState().general;
  const preset = POPUP_SIZE_PRESETS[popupSize] || POPUP_SIZE_PRESETS.medium;
  const root = document.documentElement;
  root.style.setProperty('--bodyWidth', preset.bodyWidth);
  root.style.setProperty('--tabListHeight', preset.tabListHeight);
  root.style.setProperty('--searchWidth', preset.searchWidth);
  root.style.setProperty('--headerHeight', preset.headerHeight);
  root.style.setProperty('--overlayWidth', preset.overlayWidth);
  markOverlayScrollbar();
  return store;
}

// Overlay scrollbars (macOS, GTK) take no layout space and draw over the
// right edge of the list, on top of the close buttons
function markOverlayScrollbar() {
  const list = tabList();
  const style = getComputedStyle(list);
  const borders = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
  const scrollbarWidth = list.offsetWidth - list.clientWidth - borders;
  list.classList.toggle(OVERLAY_SCROLLBAR_CLASSNAME, scrollbarWidth === 0);
}

export function overrideDomStyleSheets(store) {
  changedTypeColors(store.getState().color)
    .forEach(([type, color]) => setStyleSheetRule(`.${type}`, 'border-left-color', color));
  return store;
}

export function addEventListeners(store) {
  const { showLastQueryOnPopup, searchDebounceDelay } = store.getState().general;
  const updateSearchResults = configureSearch(store);
  const handleKeydown = keydownHandler(store);

  // Debounce search for performance, but execute immediately when clearing
  // Must capture value immediately since event object gets recycled by browser
  const debouncedSearch = debounce((value) => {
    updateSearchResults({ currentTarget: { value } });
  }, searchDebounceDelay);
  const handleSearchInput = (event) => {
    const { value } = event.currentTarget;
    if (value.length === 0) {
      debouncedSearch.clear();
      updateSearchResults(event); // Immediate clear
    } else {
      debouncedSearch(value);
    }
  };

  window.addEventListener('keydown', handleKeydown);
  deleteButton().addEventListener('click', clearInput);
  searchInput().addEventListener('input', handleSearchInput);
  prefsBtn().addEventListener('click', openSettingsPage);
  // Firefox only: right-clicking a result opens its tab menu. The overlay's
  // frame has no menus.overrideContext, so it keeps the plain menu.
  if (surface.tabMenu && browser.menus && browser.menus.onShown) {
    tabList().addEventListener('contextmenu', overrideResultContextMenu, true);
    browser.menus.onShown.addListener(updateMenuTitles);
    browser.menus.onClicked.addListener(info => runMenuItem(info, store.getState));
  }
  if (surface.backdrop) renderOverlayHints(store.getState().keyboard);

  if (showLastQueryOnPopup) {
    searchInput().addEventListener('input', updateLastQueryOnKeydown(store));
  }

  // Add tab cache invalidation listeners
  addTabCacheListeners();

  // Cleanup on popup close to prevent memory leaks
  window.addEventListener('unload', () => {
    debouncedSearch.clear();
    removeTabCacheListeners();
  });

  // Populate store with current search fn
  return Object.assign(
    {},
    store,
    { updateSearchResults },
  );
}

export function addTabListeners(getState) {
  return function doAddTabListeners(tabNode) {
    tabNode.addEventListener('click', handleTabClick(getState), true);
    tabNode.addEventListener('focus', scrollIfNeeded);
  };
}

export function doFinalSideEffects(store) {
  const { updateSearchResults } = store;
  const {
    useFallbackFont,
    showLastQueryOnPopup,
  } = store.getState().general;

  if (showLastQueryOnPopup) {
    const { lastQuery } = store.getState().state;
    searchInput().value = lastQuery;
  }
  // Give a shortcut hint
  updatePlaceholderTextWithShortcutHint()
    .catch((err) => {
      // TODO: Find a place to put these error messages away so people can
      //       c/p logged errors
      console.error(`Can't update search input placeholder text! ${err.stack}`);
    });
  // Populate the initial tab list here.
  populateTabList(updateSearchResults())
    .catch((err) => {
      console.error(`Can't populate initial tabList. ${err.stack}`);
    });


  if (useFallbackFont) {
    // Lazy for now: Just override the css styles specifying a font-family
    overrideFontStylesWithSansSerif();
  }

  return store;
}

// Possible input focus workaround
// https://bugzilla.mozilla.org/show_bug.cgi?id=1324255#c14
export function focusSearchInputWorkaround() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      searchInput().focus();
    }, 100);
  });
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => searchInput().focus(), 150);
  });
}

function updatePlaceholderTextWithShortcutHint() {
  const hintText = shortcut => `(${shortcut})`;
  return getOsShortcut()
    .then((shortcut) => {
      // Chrome leaves the shortcut unset when the suggested key conflicts
      if (shortcut) appendSearchInputPlaceholderText(hintText(shortcut));
    });
}
