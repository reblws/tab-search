import {
  searchInput,
  deleteButton,
  d,
} from './constants';
import {
  scrollIfNeeded,
  populateTabList,
  overrideFontStylesWithSansSerif,
  appendSearchInputPlaceholderText,
} from './utils/dom';
import {
  getOsShortcut,
} from './utils/browser';
import {
  keydownHandler,
  configureSearch,
  clearInput,
  handleTabClick,
  updateLastQueryOnKeydown,
} from './event-callbacks';

export function addEventListeners(store) {
  const { showLastQueryOnPopup } = store.getState().general;
  const updateSearchResults = configureSearch(store);
  const handleKeydown = keydownHandler(store);
  window.addEventListener('keydown', handleKeydown);
  deleteButton.addEventListener('click', clearInput);
  searchInput.addEventListener('input', updateSearchResults);

  if (showLastQueryOnPopup) {
    searchInput.addEventListener('input', updateLastQueryOnKeydown(store));
  }

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
    searchInput.value = lastQuery;
  }
  // Give a shortcut hint
  updatePlaceholderTextWithShortcutHint();
  // Populate the initial tab list here.
  // TODO: Add option for showing last query on popup
  populateTabList(updateSearchResults())
    // .then(() => searchInput.focus())
    .catch((err) => {
      throw new Error(`Can't update search input placeholder text! ${err}`);
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
    setTimeout(() => searchInput.focus(), 100);
  });
  d.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => searchInput.focus(), 150);
  });
}


function updatePlaceholderTextWithShortcutHint() {
  const hintText = shortcut => `(${shortcut} opens this)`;
  return getOsShortcut()
    .then(hintText)
    .then(appendSearchInputPlaceholderText);
}
