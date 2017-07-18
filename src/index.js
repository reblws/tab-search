import {
  clearInput,
  getAllTabs,
  populateTabList,
  switchActiveTab,
  navigateResults,
  injectTabsInList,
} from './dom-utils';
import {
  deleteButton,
  searchInput,
  tabList,
} from './constants';
import filterResults from './search';

// Initialize tabs
populateTabList();

// Set a timeout on focus so input is focused on popup
document.addEventListener('DOMContentLoaded', () =>
  setTimeout(() => searchInput.focus(), 150),
);
// Any (non-navigating) keydown should activate the search field,
window.addEventListener('keydown', handleKeyDown);
searchInput.addEventListener('change', updateSearchResults);
searchInput.addEventListener('keyup', updateSearchResults);
deleteButton.addEventListener('click', (event) => {
  clearInput(event.target);
  tabList.childNodes[0].focus();
});

function handleKeyDown(event) {
  switch (event.key) {
    case 'Tab':
    case 'ArrowDown':
    case 'ArrowUp':
      event.preventDefault();
    case 'ArrowRight':
    case 'ArrowLeft':
      navigateResults(event.key);
      break;
    case 'Enter':
      event.preventDefault();
      if (
        !document.activeElement.className.includes('tab-object')
        && !document.activeElement.className.includes('no-result')
      ) {
        tabList.childNodes[0].focus();
        setTimeout(() => switchActiveTab(document.activeElement.dataset.id), 150);
      } else {
        switchActiveTab(document.activeElement.dataset.id);
      }
      break;
    case 'Escape':
      // This only works in chrome, in firefox it always closes the window
      if (searchInput.value.length === 0) {
        window.close();
      } else {
        clearInput(searchInput);
      }
      break;
    default:
      searchInput.focus();
      break;
  }
}

function updateSearchResults(event) {
  const isSearchEmpty = searchInput.value.length === 0;
  // If input is empty hide the button
  if (isSearchEmpty) {
    deleteButton.classList.add('hidden');
  } else {
    deleteButton.classList.remove('hidden');
  }

  const query = event.target.value.trim().toLowerCase();
  const getSearchResults = isSearchEmpty
    ? x => x
    : filterResults(query);
  return getAllTabs()
    .then(getSearchResults)
    .then(injectTabsInList);
}
