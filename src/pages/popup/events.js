/* Main DOM event-handlers */
import { commandBindings, interpretKey } from 'core/navigation/keys';
import { clickIntent } from 'core/navigation/click';
import {
  injectTabsInList,
  addHeadTabListNodeSelectedStyle,
} from './render';
import { navigateResults } from './commands';
import {
  switchActiveTab,
  restoreClosedTab,
  deleteTab,
  openBookmark,
  openHistoryItem,
} from './tab-actions';
import { TAB_DELETE_BTN_CLASSNAME } from './classnames';
import {
  deleteButton,
  searchInput,
  tabList,
} from './nodes';
import { updateLastQuery } from './actions';
import filterResults from './search';

export function configureSearch(store) {
  const { getState, tabQueryPromise, currentWindowId } = store;
  const { fuzzy, general } = getState();
  // Token guarding the two-phase render below: a newer query always wins
  // over an older query's delayed extra results
  let renderToken = 0;
  return function updateSearchResults(event = { currentTarget: { value: '' } }) {
    const isSearchEmpty = event.currentTarget.value.length === 0;
    // If input is empty hide the button
    if (isSearchEmpty) {
      deleteButton().classList.add('hidden');
    } else {
      deleteButton().classList.remove('hidden');
    }
    // isSearchEmpty isn't based on this var so we can show delete button with
    // just spaces
    const query = event.currentTarget.value.trim().toLowerCase();
    const injectResults = injectTabsInList(getState);
    const emphasizeHead = (results) => {
      // Apply the selected style to the head of the tabList to suggest
      // pressing <Enter> from the search input activates this tab
      if (results.length > 0 && !isSearchEmpty) {
        addHeadTabListNodeSelectedStyle();
        // Scroll to the top
        tabList().firstElementChild.scrollIntoView(true);
      }
      return results;
    };
    const token = ++renderToken;
    return Promise.resolve(tabQueryPromise())
      .then(filterResults(query, fuzzy, general, currentWindowId))
      .then(({ initial, extras }) => initial
        // Render the open tabs right away; the extra sources (recently
        // closed tabs / history / bookmarks) can stall for a long time on
        // FF 157+ (Nova), so they get merged in a second pass further below
        .then(results => (token === renderToken ? injectResults(results) : results))
        .then(emphasizeHead)
        .then((results) => {
          extras
            .then((merged) => {
              if (token !== renderToken) return;
              injectResults(merged);
              emphasizeHead(merged);
            })
            .catch((e) => {
              console.error(`Couldn't merge extra search results: ${e}`);
            });
          return results;
        }));
  };
}

export function clearInput() {
  searchInput().value = '';
  searchInput().focus();
  // Trigger input event to update the tab list
  searchInput().dispatchEvent(new Event('input'));
}

// The keydown values interpretKey needs, without the live event
const keyValues = ({ key, code, ctrlKey, altKey, shiftKey, metaKey }) =>
  ({ key, code, ctrlKey, altKey, shiftKey, metaKey });

export function keydownHandler(store) {
  const bindings = commandBindings(store.getState().keyboard);
  const focusTargets = {
    first: () => tabList().firstChild,
    last: () => tabList().lastChild,
    search: searchInput,
  };
  return function handleKeyDown(event) {
    const searchFocused = document.activeElement === searchInput();
    const { preventDefault, command, focus } =
      interpretKey(keyValues(event), bindings, { searchFocused });
    if (preventDefault) event.preventDefault();
    if (command) navigateResults(command, store.getState);
    if (focus) focusTargets[focus]().focus();
  };
}

export function handleTabClick(getState) {
  const actions = {
    close: row => deleteTab(row, getState().general, true),
    switch: row => switchActiveTab(row.dataset),
    restore: row => restoreClosedTab(row.dataset),
    openBookmark: row => openBookmark(row.dataset),
    openHistory: row => openHistoryItem(row.dataset),
  };
  return function doHandleTabClick(event) {
    const { currentTarget: row, ctrlKey, target } = event;
    // The click can land on the delete button's SVG or path
    const deleteBtn = row.querySelector(`.${TAB_DELETE_BTN_CLASSNAME}`);
    const intent = clickIntent({
      type: row.dataset.type,
      ctrlKey,
      onDeleteButton: !!deleteBtn && deleteBtn.contains(target),
    });
    return intent ? actions[intent](row) : undefined;
  };
}

export function updateLastQueryOnKeydown(store) {
  const { dispatch } = store;
  return (event) => {
    const { value } = event.currentTarget;
    dispatch(updateLastQuery(value.trim()));
  };
}
