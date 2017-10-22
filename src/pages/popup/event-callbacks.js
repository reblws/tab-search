/* Main DOM event-handlers */
import {
  switchActiveTab,
  navigateResults,
  injectTabsInList,
} from './utils/dom';
import {
  restoreClosedTab,
  deleteTab,
} from './utils/browser';
import {
  deleteButton,
  searchInput,
  tabList,
  SESSION_TYPE,
} from './constants';
import filterResults from './search';

export function configureSearch({ getState, loadedTabs, currentWindowId }) {
  const { fuzzy, general } = getState();
  return function updateSearchResults(event = { currentTarget: { value: '' } }) {
    const isSearchEmpty = event.currentTarget.value.length === 0;
    // If input is empty hide the button
    if (isSearchEmpty) {
      deleteButton.classList.add('hidden');
    } else {
      deleteButton.classList.remove('hidden');
    }
    const query = event.currentTarget.value.trim().toLowerCase();
    return Promise.resolve(loadedTabs)
      .then(filterResults(query, fuzzy, general, currentWindowId))
      .then(injectTabsInList(getState));
  };
}

export function clearInput(event) {
  event.target.value = '';
  tabList.childNodes[0].focus();
}

export function handleKeyDown(event) {
  switch (event.key) {
    case 'Control':
      break;
    case 'Delete':
    case 'Backspace':
      if (event.ctrlKey && document.activeElement !== searchInput) {
        const tabId = parseInt(document.activeElement.dataset.id, 10);
        deleteTab(tabId);
      }
      break;
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

      // If we're pressing enter from the searchbar
      const firstChildNode = tabList.childNodes[0];
      if (document.activeElement === searchInput
        && 'id' in firstChildNode.dataset) {
        firstChildNode.click();
      } else {
        document.activeElement.click();
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

export function handleTabClick(getState) {
  return function doHandleTabClick(event) {
    // TODO: get settings here
    const { showRecentlyClosed } = getState().general;
    const { currentTarget, ctrlKey } = event;
    const { id, type } = currentTarget.dataset;
    switch (type) {
      case SESSION_TYPE: {
        if (ctrlKey) break;
        restoreClosedTab(id);
        break;
      }
      default: {
        if (ctrlKey) {
          deleteTab(currentTarget, showRecentlyClosed, true);
        } else {
          switchActiveTab(id);
        }
      }
    }
  };
}
