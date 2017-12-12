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
  // Get keys from map with [Map].keys() then convert
  // to array so we have our favorite array funcs
  const key = [...controlMap.keys()].find(x => compareKbdCommand(x, kbdCmd));
  switch (controlMap.get(key)) {
    case TAB_NEXT: {
      removeHeadTabListNodeSelectedStyle();
      if (d.activeElement !== searchInput) {
        d.activeElement.nextElementSibling.focus();
      } else {
        tabList.firstElementChild.focus();
      }
      break;
    }
    case TAB_PREV: {
      removeHeadTabListNodeSelectedStyle();
      const prevSibling = d.activeElement.previousElementSibling;
      if (prevSibling) {
        prevSibling.focus();
      } else {
        searchInput.focus();
      }
      break;
    }
    case TAB_DELETE: {
      // TODO
      deleteTab(d.activeElement, showRecentlyClosed);
    }
    case TAB_OPEN: {
      if (d.activeElement === searchInput) {
        tabList.firstElementChild.click();
      } else {
        d.activeElement.click();
      }
      break;
    }
    case TAB_REFRESH:
    case TAB_PIN:
    case URL_COPY:
    case TAB_BOOKMARK:
    case DUPLICATE_TAB_DELETE:
    case MUTE_TOGGLE:
    case TAB_MOVE:
    default:
      break;
  }
}

/*
export function navigateResults(direction) {
  switch (direction) {
    case 'Tab':
    case 'ArrowRight':
    case 'ArrowDown': {
      const nextSibling = d.activeElement.nextElementSibling;
      if (nextSibling && d.activeElement !== searchInput) {
        nextSibling.focus();
      } else {
        // Return to top if next !exist
        tabList.firstElementChild.focus();
      }
      break;
    }
    case 'ArrowLeft':
    case 'ArrowUp': {
      const prevSibling = d.activeElement.previousElementSibling;
      if (prevSibling) {
        prevSibling.focus();
      } else {
        searchInput.focus();
      }
      break;
    }
    default: break;
  }
}
*/
