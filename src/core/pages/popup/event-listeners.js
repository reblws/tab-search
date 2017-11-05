import {
  searchInput,
  deleteButton,
} from './constants';
import {
  scrollIfNeeded,
  populateTabList,
} from './utils/dom';
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
  // Populate the initial tab list here.
  // Set a timeout so the input actually focuses
  // TODO: Add option for showing last query on popup
  populateTabList(updateSearchResults())
    .then(() => setTimeout(() => searchInput.focus(), 150));
  return store;
}

export const addTabListeners = getState => function doAddTabListeners(tabNode) {
  tabNode.addEventListener('click', handleTabClick(getState), true);
  tabNode.addEventListener('focus', scrollIfNeeded);
}
