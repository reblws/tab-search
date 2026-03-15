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
  TAB_GROUP_TOGGLE,
} from 'core/keyboard';
import {
  deleteTab,
  reloadTab,
  pinTab,
  queryTab,
  muteTab,
  groupTab,
  ungroupTab,
  tabGroupsSupported,
  queryTabGroups,
} from './browser';
import { invalidateGroupCache } from '../caches';
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
  TAB_MUTED_CLASSNAME,
  TAB_PIN_CLASSNAME,
  TAB_TYPE,
  OTHER_WINDOW_TAB_TYPE,
  RELOAD_SVG_PATH,
} from '../constants';

export function navigateResults(cmdKey, getState) {
  const generalSettings = getState().general;
  const isNoResult = !!d.getElementById(NO_RESULT_CLASSNAME) || tabList.children.length === 0;
  const isSearchActive = d.activeElement === searchInput;
  const selectedTab = !isSearchActive
    ? d.activeElement
    : tabList.firstElementChild;
  const isRegularTab = ({ type }) =>
    type === OTHER_WINDOW_TAB_TYPE || type === TAB_TYPE;
  const { id } = selectedTab.dataset;
  switch (cmdKey) {
    case TAB_NEXT: {
      removeHeadTabListNodeSelectedStyle();
      if (isSearchActive) {
        selectedTab.focus();
      } else if (selectedTab.nextElementSibling) {
        selectedTab.nextElementSibling.focus();
      } else { // If no nextElementSibling focus searchbar
        searchInput.focus();
      }
      break;
    }
    case TAB_PREV: {
      removeHeadTabListNodeSelectedStyle();
      const prevSibling = selectedTab.previousElementSibling;
      if (prevSibling) {
        prevSibling.focus();
      } else if (document.activeElement !== searchInput) {
        searchInput.focus();
      } else { // We're at the top but searchInput is focused
        tabList.lastChild.focus();
      }
      break;
    }
    case TAB_DELETE: {
      if (!isRegularTab(selectedTab.dataset) || isSearchActive) {
        break;
      }
      deleteTab(selectedTab, generalSettings);
      break;
    }
    case TAB_OPEN: {
      selectedTab.click();
      break;
    }
    case TAB_REFRESH: {
      if (!isRegularTab(selectedTab.dataset)) {
        break;
      }
      const selectedTabImg = selectedTab.querySelector('.tab-img img');
      const originalFavIconSrc = selectedTabImg.src;
      selectedTabImg.setAttribute('src', RELOAD_SVG_PATH);
      reloadTab(id).then(() => {
        setTimeout(
          () => { selectedTabImg.setAttribute('src', originalFavIconSrc); },
          500,
        );
      });
      break;
    }
    case TAB_PIN: {
      if (!isRegularTab(selectedTab.dataset)) {
        break;
      }
      const togglePinStatus = ({ pinned }) => pinTab(id, !pinned);
      queryTab(id).then(togglePinStatus)
        .then(({ pinned }) => {
          if (pinned) {
            selectedTab.classList.add(TAB_PIN_CLASSNAME);
          } else {
            selectedTab.classList.remove(TAB_PIN_CLASSNAME);
          }
        });
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
            deleteTab(domNode, generalSettings);
          }
        });
      });
      break;
    }
    case MUTE_TOGGLE: {
      // Issue: Successive mutes only works up till it's
      //        pressed twice. After that it doesn't
      //        toggle anymore.
      if (!isRegularTab(selectedTab.dataset)) {
        break;
      }
      const toggleMuteStatus = ({ audible }) => muteTab(id, audible);
      queryTab(id).then(toggleMuteStatus).then(({ mutedInfo }) => {
        if (mutedInfo.muted) {
          selectedTab.classList.add(TAB_MUTED_CLASSNAME);
        } else {
          selectedTab.classList.remove(TAB_MUTED_CLASSNAME);
        }
      });
      break;
    }
    case TAB_GROUP_TOGGLE: {
      if (!tabGroupsSupported() || !isRegularTab(selectedTab.dataset) || isSearchActive) {
        break;
      }
      const tabId = parseInt(id, 10);
      queryTab(id).then((tab) => {
        if (tab.groupId && tab.groupId !== -1) {
          // Tab is grouped — ungroup it
          return ungroupTab(tabId).then(() => {
            invalidateGroupCache();
            const badge = selectedTab.querySelector('.tab-group-badge');
            if (badge) badge.remove();
          });
        }
        // Tab is ungrouped — assign to most recent group or create new
        return queryTabGroups().then((groupMap) => {
          const groups = [...groupMap.values()];
          const opts = groups.length > 0
            ? groupTab(tabId, groups[0].id)
            : groupTab(tabId);
          return opts;
        }).then((groupId) => {
          invalidateGroupCache();
          // Re-query to get updated group info and update the DOM
          return queryTabGroups().then((groupMap) => {
            const group = groupMap.get(groupId);
            if (!group) return;
            // Remove existing badge if any
            const existing = selectedTab.querySelector('.tab-group-badge');
            if (existing) existing.remove();
            // Add new badge
            const badgeNode = document.createElement('div');
            badgeNode.classList.add('tab-group-badge');
            const dotNode = document.createElement('span');
            dotNode.classList.add('tab-group-badge__dot');
            dotNode.style.backgroundColor = `var(--tab-group-${group.color})`;
            badgeNode.appendChild(dotNode);
            if (group.title) {
              const labelNode = document.createElement('span');
              labelNode.classList.add('tab-group-badge__label');
              labelNode.textContent = group.title;
              badgeNode.appendChild(labelNode);
            }
            const groupLabel = group.title
              ? `Group: ${group.title} (${group.color})`
              : `Group: ${group.color}`;
            badgeNode.setAttribute('aria-label', groupLabel);
            selectedTab.querySelector('.tab-info').appendChild(badgeNode);
          });
        });
      });
      break;
    }
    case TAB_MOVE:
      break;
    // later
    default:
      break;
  }
}
