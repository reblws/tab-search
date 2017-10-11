import {
  searchInput,
  deleteButton,
} from './constants';
import {
  handleKeyDown,
  configureSearch,
  clearInput,
} from './event-handlers';

export default function addEventListeners(store) {
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
