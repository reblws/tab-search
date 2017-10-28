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
  // Populate the here and now
  const updateSearchResults = configureSearch(store);
  const handleKeydown = keydownHandler(store);
  populateTabList(updateSearchResults()).then(() => searchInput.focus());
  window.addEventListener('keydown', handleKeydown);
  deleteButton.addEventListener('click', clearInput);
  searchInput.addEventListener('change', updateSearchResults);
  searchInput.addEventListener('keyup', updateSearchResults);
  return store;
}

export const addTabListeners = getState => function doAddTabListeners(tabNode) {
  tabNode.addEventListener('click', handleTabClick(getState), true);
  tabNode.addEventListener('focus', scrollIfNeeded);
}
