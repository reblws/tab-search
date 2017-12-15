import {
  TAB_DELETE,
  TAB_OPEN,
  TAB_NEXT,
  TAB_PREV,
  TAB_MOVE,
  TAB_REFRESH,
  TAB_PIN,
  URL_COPY,
  TAB_BOOKMARK,
  DUPLICATE_TAB_DELETE,
  MUTE_TOGGLE,
} from 'core/keyboard/constants';
import { compareKbdCommand } from 'core/keyboard/compare';
import {
  deleteTab,
  reloadTab,
  pinTab,
} from './browser';
import {
  removeHeadTabListNodeSelectedStyle,
} from './dom';
import {
  d,
  tabList,
  searchInput,
} from '../constants';


export function navigateResults(kbdCmd, controlMap, showRecentlyClosed) {
  // Should make sure no errors if tablist is empty
  const key = [...controlMap.keys()].find(x => compareKbdCommand(x, kbdCmd));
  const isSearchActive = d.activeElement === searchInput;
  const selectedTab = !isSearchActive
    ? d.activeElement
    : tabList.firstElementChild;
  switch (controlMap.get(key)) {
    case TAB_NEXT: {
      removeHeadTabListNodeSelectedStyle();
      if (isSearchActive) {
        selectedTab.focus();
      } else {
        selectedTab.nextElementSibling.focus();
      }
      break;
    }
    case TAB_PREV: {
      removeHeadTabListNodeSelectedStyle();
      const prevSibling = selectedTab.previousElementSibling;
      if (prevSibling) {
        prevSibling.focus();
      } else {
        searchInput.focus();
      }
      break;
    }
    case TAB_DELETE: {
      // TODO
      if (isSearchActive) {
        break;
      }
      deleteTab(d.activeElement, showRecentlyClosed);
      break;
    }
    case TAB_OPEN: {
      selectedTab.click();
      break;
    }
    case TAB_REFRESH: {
      // TODO: visual indicator
      const { id } = selectedTab.dataset;
      reloadTab(id);
      break;
    }
    case TAB_PIN: {
      // TODO: visual indicator
      // ISSUE: Can't toggle it
      // we can grab the staate of the selected node by querying b.tabs
      // Pin it in the .then() callback based on the state
      // grabbed from browser.query
      const { id } = selectedTab.dataset;
      pinTab(id)
    }
    // browser.tabs.update({ id, pinned = !pinned })
    case URL_COPY: {
      const copyText = selectedTab.querySelector('.tab-url');
      const range = d.createRange();
      range.selectNode(copyText);
      window.getSelection().addRange(range);
      d.execCommand('copy');
    }
    case TAB_BOOKMARK: {
      // This requires bookmarks permission
      // browser.bookmarks.create()
      // TODO: when we merge in the bookmarks branch
    }
    case DUPLICATE_TAB_DELETE: {
      // search dom for tabs with duplicate urls?
      // delete all
    }
    case MUTE_TOGGLE:
    // browser.tabs.update({ id, muted })
    case TAB_MOVE:
    // later
    default:
      break;
  }
}
