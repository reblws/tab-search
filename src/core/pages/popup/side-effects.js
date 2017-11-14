import {
  searchInput,
  deleteButton,
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
} from './event-callbacks';

export function addEventListeners(store) {
  const updateSearchResults = configureSearch(store);
  const handleKeydown = keydownHandler(store);
  window.addEventListener('keydown', handleKeydown);
  deleteButton.addEventListener('click', clearInput);
  searchInput.addEventListener('change', updateSearchResults);
  searchInput.addEventListener('keyup', updateSearchResults);

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
  const { useFallbackFont } = store.getState().general;

  // Give a shortcut hint
  updatePlaceholderTextWithShortcutHint();
  // Populate the initial tab list here.
  // TODO: Add option for showing last query on popup
  populateTabList(updateSearchResults())
    .then(() => setTimeout(() => searchInput.focus(), 100))
    .catch((err) => {
      throw new Error(`Can't update search input placeholder text! ${err}`);
    });

  if (useFallbackFont) {
    // Lazy for now: Just override the css styles specifying a font-family
    overrideFontStylesWithSansSerif();
  }

  return store;
}


function updatePlaceholderTextWithShortcutHint() {
  const hintText = shortcut => `(${shortcut} opens this)`;
  return getOsShortcut()
    .then(hintText)
    .then(appendSearchInputPlaceholderText);
}
