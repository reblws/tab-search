/* Main DOM event-handlers */
import keyboard from 'core/keyboard';
import {
  injectTabsInList,
  addHeadTabListNodeSelectedStyle,
} from './utils/dom';
import { navigateResults } from './utils/keyboard';
import {
  switchActiveTab,
  restoreClosedTab,
  deleteTab,
  openBookmark,
  openHistoryItem,
} from './utils/browser';
import {
  deleteButton,
  searchInput,
  tabList,
  SESSION_TYPE,
  HISTORY_TYPE,
  BOOKMARK_TYPE,
  TAB_TYPE,
  OTHER_WINDOW_TAB_TYPE,
} from './constants';
import { updateLastQuery } from './actions';
import filterResults from './search';

export function configureSearch(store) {
  const { getState, tabQueryPromise, currentWindowId } = store;
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
    return Promise.resolve(tabQueryPromise())
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
  return Object.keys(obj)
    .reduce((acc, key) => acc.set(func(obj[key]), key), new Map());
}

function isModifierSingle(event) {
  const modifiers = [
    'Control',
    'Ctrl',
    'Alt',
    'Shift',
    'Meta',
    'Shift',
  ];
  return modifiers.some(m => event.key === m);
}

export function keydownHandler(store) {
  const { showRecentlyClosed } = store.getState().general;
  const { keyboard: keyboardControls } = store.getState();
  // The keyboard object is an object with the mapping { [ACTION]: kbdcommand }
  // Mirror the keys and values so we have a Map:
  // {[kbdCommand]: ACTION}
  const kbdControlMap = swapKeyValueMap(keyboardControls, x => x.command);
  return function handleKeyDown(event) {
    if (isModifierSingle(event)) {
      event.preventDefault();
    }
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
    if (keyboard.isValid(event)) {
      const cmd = keyboard.command(event);
      const key = [...kbdControlMap.keys()].find(x => keyboard.isEqual(x, cmd));
      return navigateResults(kbdControlMap.get(key), showRecentlyClosed);
    }
    const shouldJustFocusSearchBar = (event.key === 'Backspace' && !isModifierSingle(event))
      || (/^([A-Za-z]|\d)$/.test(event.key) && !isModifierSingle(event));
    if (shouldJustFocusSearchBar) {
      searchInput.focus();
    }
    return noop();
  };
}

function noop() {}

export function handleTabClick(getState) {
  return function doHandleTabClick(event) {
    const {
      showRecentlyClosed,
    } = getState().general;
    const { currentTarget, ctrlKey } = event;
    const { dataset } = currentTarget;
    const { type } = dataset;
    // Decide what to do depending if ctrl is held
    switch (type) {
      case OTHER_WINDOW_TAB_TYPE:
      case TAB_TYPE: {
        if (ctrlKey) {
          return deleteTab(currentTarget, showRecentlyClosed, true);
        }
        return switchActiveTab(dataset);
      }
      case SESSION_TYPE: {
        if (ctrlKey) {
          return noop();
        }
        return restoreClosedTab(dataset);
      }
      case BOOKMARK_TYPE: {
        if (ctrlKey) {
          return noop();
        }
        return openBookmark(dataset);
      }
      case HISTORY_TYPE: {
        if (ctrlKey) {
          return noop();
        }
        return openHistoryItem(dataset);
      }
      default: return noop();
    }
  };
}

export function updateLastQueryOnKeydown(store) {
  const { dispatch } = store;
  return (event) => {
    const { value } = event.currentTarget;
    dispatch(updateLastQuery(value.trim()));
  };
}
