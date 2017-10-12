import {
  searchInput,
  deleteButton,
} from './constants';
import {
  scrollIfNeeded,
} from './dom-utils';
import {
  handleKeyDown,
  configureSearch,
  clearInput,
  handleTabClick,
} from './event-callbacks';

export function addEventListeners(store) {
  const updateSearchResults = configureSearch(store);
  // setTimeout(() => searchInput.focus(), 150);
  // FF57: No longer need the timeout since the new UIStore initializing logic
  //       takes enough time
  searchInput.focus();
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
