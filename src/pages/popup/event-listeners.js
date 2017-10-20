import {
  searchInput,
  deleteButton,
} from './constants';
import {
  scrollIfNeeded,
  populateTabList,
} from './utils/dom';
import {
  handleKeyDown,
  configureSearch,
  clearInput,
  handleTabClick,
} from './event-callbacks';

export function addEventListeners(store) {
  // Populate the here and now
  const updateSearchResults = configureSearch(store);
  populateTabList(updateSearchResults()).then(() => searchInput.focus());
  window.addEventListener('keydown', handleKeyDown);
  deleteButton.addEventListener('click', clearInput);
  searchInput.addEventListener('change', updateSearchResults);
  searchInput.addEventListener('keyup', updateSearchResults);
  return store;
}

export function addTabListeners(tabNode) {
  tabNode.addEventListener('click', handleTabClick, true);
  tabNode.addEventListener('focus', scrollIfNeeded);
}
