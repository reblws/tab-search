/* Main DOM event-handlers */
// TODO: give each handler its own file
import {
  isValidKbdCommand,
  kbdCommand,
} from 'core/keyboard';
import {
  injectTabsInList,
  addHeadTabListNodeSelectedStyle,
} from './utils/dom';
import { navigateResults } from './utils/keyboard';
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
          // Scroll to the top
          tabList.firstElementChild.scrollIntoView(true);
        }
        return results;
      });
  };
}

export function clearInput(event) {
  event.target.value = '';
  tabList.childNodes[0].focus();
}

// Given an object returns a Map with the keys and values swapped
function swapKeyValueMap(obj, func = x => x) {
  return Object.keys(obj).reduce((acc, key) => {
    return acc.set(func(obj[key]), key);
  }, new Map());
}

export function keydownHandler(store) {
  const { showRecentlyClosed } = store.getState().general;
  const { keyboard: keyboardControls } = store.getState();
  // The keyboard object is an object with the mapping { [ACTION]: kbdcommand }
  // Mirror the keys and values so we have a Map:
  // {[kbdCommand]: ACTION}
  const kbdControlMap = swapKeyValueMap(keyboardControls, x => x.command);
  return function handleKeyDown(event) {
    // Handle preventing default
    // Delete, Backspace, Tab, ArrowUp, Arrowdown, Enter
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'Enter':
        event.preventDefault();
        break;
      default: break;
    }
    // If it's a valid kbdCommand (i.e. does a configurable action),
    // pass it to navigateResults whose only responsibility is performing
    // a side effect based on a given kbdCommand and the kbdControlMap
    // passed in from state.
    if (isValidKbdCommand(event)) {
      return navigateResults(
        // Find the right object key
        kbdCommand(event),
        kbdControlMap,
        showRecentlyClosed,
        store,
      );
    }
    switch (event.key) {
      case 'Backspace':
      default: {
        searchInput.focus();
      }
    }
    return;
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
