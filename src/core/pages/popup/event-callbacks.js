/* Main DOM event-handlers */
import {
  navigateResults,
  injectTabsInList,
  addHeadTabListNodeSelectedStyle,
  removeHeadTabListNodeSelectedStyle,
} from './utils/dom';
import {
  switchActiveTab,
  restoreClosedTab,
  deleteTab,
} from './utils/browser';
import {
  deleteButton,
  searchInput,
  tabList,
  SESSION_TYPE,
} from './constants';
import { updateLastQuery } from './actions';
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
    // isSearchEmpty isn't based on this var so we can show delete button with
    // just spaces
    const query = event.currentTarget.value.trim().toLowerCase();
    return Promise.resolve(loadedTabs)
      .then(filterResults(query, fuzzy, general, currentWindowId))
      .then(injectTabsInList(getState))
      .then((results) => {
        // Apply the selected style to the head of the tabList to suggest
        // pressing <Enter> from the search input activates this tab
        if (results.length > 0 && !isSearchEmpty) {
          addHeadTabListNodeSelectedStyle();
        }
        return results;
      });
  };
}

export function clearInput(event) {
  event.target.value = '';
  tabList.childNodes[0].focus();
}

export function keydownHandler(store) {
  const { showRecentlyClosed } = store.getState().general;
  return function handleKeyDown(event) {
    switch (event.key) {
      case 'Control':
        break;
      case 'Delete':
      case 'Backspace':
        if (event.ctrlKey && document.activeElement !== searchInput) {
          deleteTab(document.activeElement, showRecentlyClosed);
        }
        break;
      case 'Tab':
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
      case 'ArrowRight':
      case 'ArrowLeft':
        // When navigating remove the applied style
        removeHeadTabListNodeSelectedStyle();
        navigateResults(event.key);
        break;
      case 'Enter': {
        event.preventDefault();

        // If we're pressing enter from the searchbar
        const firstChildNode = tabList.firstElementChild;
        if (document.activeElement === searchInput) {
          firstChildNode.click();
        } else {
          document.activeElement.click();
        }
        break;
      }
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
  };
}

export function handleTabClick(getState) {
  return function doHandleTabClick(event) {
    const {
      showRecentlyClosed,
    } = getState().general;
    const { currentTarget, ctrlKey } = event;
    const { type } = currentTarget.dataset;
    if (type === SESSION_TYPE) {
      if (ctrlKey) return;
      restoreClosedTab(currentTarget.dataset);
    } else if (ctrlKey) {
      deleteTab(currentTarget, showRecentlyClosed, true);
    } else {
      switchActiveTab(currentTarget.dataset);
    }
  };
}

export function updateLastQueryOnKeydown(store) {
  const { dispatch } = store;
  return (event) => {
    const { value } = event.currentTarget;
    return dispatch(updateLastQuery(value.trim()));
  };
}
