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
  queryTab,
  muteTab,
} from './browser';
import {
  removeHeadTabListNodeSelectedStyle,
  selectNodeText,
} from './dom';
import {
  d,
  tabList,
  searchInput,
  NO_RESULT_CLASSNAME,
  TAB_URL_CLASSNAME,
  SESSION_TYPE,
} from '../constants';

// The main keydown handler calls this if one of the above commands
// are pressed
export function navigateResults(
  kbdCmd,
  controlMap,
  showRecentlyClosed,
) {
  // Should make sure no errors if tablist is empty
  // Should probably find the key in the parent function
  const controlKey = [...controlMap.keys()].find(x => compareKbdCommand(x, kbdCmd));
  const isNoResult = tabList.children[0].classList.contains(NO_RESULT_CLASSNAME);
  const isSearchActive = d.activeElement === searchInput;
  const selectedTab = !isSearchActive
    ? d.activeElement
    : tabList.firstElementChild;
  switch (controlMap.get(controlKey)) {
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
      if (isSearchActive) {
        break;
      }
      deleteTab(selectedTab, showRecentlyClosed);
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
      // TODO: visual pinning indicator
      const { id } = selectedTab.dataset;
      const togglePinStatus = ({ pinned }) => pinTab(id, !pinned);
      queryTab(id).then(togglePinStatus);
      break;
    }
    // browser.tabs.update({ id, pinned = !pinned })
    case URL_COPY: {
      const copyNode = selectedTab.querySelector(`.${TAB_URL_CLASSNAME}`);
      selectNodeText(copyNode);
      d.execCommand('copy');
      break;
    }
    case TAB_BOOKMARK: {
      // This requires bookmarks permission
      // browser.bookmarks.create()
      // TODO: Add this when the bookmarks branch is merged
      break;
    }
    case DUPLICATE_TAB_DELETE: {
      // Delete all duplicate tabs
      // Gather all datasets and hash each url
      // and each id that contains such url
      // Only deletes tabs that are inside the classlist
      if (isNoResult) {
        break;
      }

      // Filter the array of tab list's children down
      // to the ones with duplicate tabs
      const urlToIdObj = [...tabList.children]
        .reduce((acc, node) => {
          const { url, type } = node.dataset;
          if (type === SESSION_TYPE) {
            return acc;
          }
          const hasUrl = !!acc[url];
          return hasUrl
            ? Object.assign({}, acc, { [url]: [...acc[url], node] })
            : Object.assign({ [url]: [node] }, acc);
        }, {});
      const sortLastAccessed = (a, b) => a.lastAccessed - b.lastAccessed;
      // Want to sort by last accessed. The most recently used one should be the tab to keep
      const duplicateTabs = Object.keys(urlToIdObj)
        .filter(k => urlToIdObj[k].length > 1)
        .reduce(
          (acc, k) => Object.assign(
            {},
            acc,
            { [k]: urlToIdObj[k].sort(sortLastAccessed) }, // Sort it by lastAccessed here
          ),
          {},
        );
      Object.keys(duplicateTabs).forEach((key) => {
        const domNodes = duplicateTabs[key];
        domNodes.forEach((domNode, index) => {
          if (index !== 0) {
            deleteTab(domNode, showRecentlyClosed);
          }
        });
      });
      break;
    }
    case MUTE_TOGGLE: {
      // Issue: Successive mutes only works up till it's
      //        pressed twice. After that it doesn't
      //        toggle anymore.
      const { id } = selectedTab.dataset;
      const toggleMuteStatus = ({ audible }) => muteTab(id, audible);
      queryTab(id).then(toggleMuteStatus);
      break;
    }
    case TAB_MOVE:
      break;
    // later
    default:
      break;
  }
}
