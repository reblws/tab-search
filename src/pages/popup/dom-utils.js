import { addTabListeners } from './event-listeners';
import {
  favIconFallback,
  alertCircle,
  tabList,
  searchInput,
} from './constants';
import { badFavIconCache, deletedTabsCache } from './caches';
// Store all the bad favIcons so we don't get loading jank if a favIcon !exist
function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function isChromeLink(src) {
  return /chrome:\/\//.test(src);
}

function isURL(src) {
  const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
  const spacePattern = /\s+/g;
  return urlPattern.test(src) && !spacePattern.test(src);
}

function getBasePath(src) {
  const { origin } = new URL(src);
  return origin;
}


export function switchActiveTab(id) {
  const numId = parseInt(id, 10);
  browser.tabs.update(numId, { active: true });
  window.close();
}

export function switchTabs() {
  // this: should be the tab-object node
  const tabId = this.dataset.id;
  switchActiveTab(tabId);
}

export function tabToTag({ favIconUrl, title, id, url }) {
  const isValidFavIconUrl = favIconUrl
    && !isChromeLink(favIconUrl)
    && !badFavIconCache().includes(favIconUrl);
  const favIconLink = isValidFavIconUrl
    ? favIconUrl
    : favIconFallback;
  // Just check if it's a url for now so we can shorten it
  const tabTitle = isURL(title)
    ? getBasePath(title)
    : title;

  return createTabObject({
    id,
    url,
    tabTitle,
    favIconLink,
  });
}

function createTabObject({
  id,
  url,
  tabTitle,
  favIconLink,
}) {
  // Create the parent div
  // <div class="tab-object" data-id="${id}" tabIndex="0">
  const tabObjectNode = document.createElement('div');
  tabObjectNode.setAttribute('data-id', id);
  tabObjectNode.setAttribute('tabindex', '0');
  tabObjectNode.classList.add('tab-object');

  // favicon
  // <img src="${favIconLink}">
  const favIconNode = document.createElement('img');
  favIconNode.setAttribute('src', favIconLink);
  favIconNode.onerror = handleBadSvg;

  // tab-info
  //    <div class="tab-info">
  const tabInfoNode = document.createElement('div');
  tabInfoNode.setAttribute('class', 'tab-info');

  //      <strong>${title}</strong>
  const titleNode = document.createElement('div');
  titleNode.classList.add('tab-title');
  titleNode.appendChild(document.createTextNode(tabTitle));

  //      <p>${url}</p>
  const urlNode = document.createElement('p');
  urlNode.appendChild(document.createTextNode(url));

  // Append all block elements
  tabInfoNode.appendChild(titleNode);
  tabInfoNode.appendChild(urlNode);

  tabObjectNode.appendChild(favIconNode);
  tabObjectNode.appendChild(tabInfoNode);

  return tabObjectNode;
}

function handleBadSvg() {
  badFavIconCache().push(this.src);
  this.src = favIconFallback;
}

// Get focused node's position relative to the current scrolled view
export function getNodePositions(parentNode, selectedNode) {
  const parentHeight = parentNode.offsetHeight;
  const selectedTop = (
    selectedNode.offsetTop - parentNode.offsetTop
  ) - parentNode.scrollTop;
  const selectedBottom = selectedNode.offsetHeight + selectedTop;
  return {
    parentHeight,
    selectedBottom,
    selectedTop,
  };
}

export function createNoResult() {
  // <div class="no-result">
  //   <object type="image/svg+xml" data="/assets/alert-circle.svg"></object>
  //   <strong>No tabs found</strong>
  // </div>
  const noResultNode = document.createElement('div');
  noResultNode.classList.add('no-result');

  const alertCircleNode = document.createElement('object');
  alertCircleNode.classList.add('no-result__circle');
  alertCircleNode.setAttribute('type', 'image/svg+xml');
  alertCircleNode.setAttribute('data', alertCircle);

  const strongMsgNode = document.createElement('strong');
  strongMsgNode.classList.add('no-result__msg');
  strongMsgNode.appendChild(document.createTextNode('No tabs found'));

  noResultNode.appendChild(alertCircleNode);
  noResultNode.appendChild(strongMsgNode);
  return noResultNode;
}

export function injectTabsInList(tabArray) {
  const wasNoResult = tabList.querySelectorAll('.tab-object').length ===
0;
  const showNoResult = tabArray.length === 0;
  // Don't update dom if we're going to show no results again
  if (wasNoResult && showNoResult) return;

  clearChildren(tabList);

  // Add nodes to tabList & attach event listeners
  if (showNoResult) {
    tabList.appendChild(createNoResult());
  } else {
    tabArray.map(tabToTag).forEach((tabNode) => {
      addTabListeners(tabNode);
      tabList.appendChild(tabNode);
    });
  }
}

export function scrollIfNeeded(event) {
  // If the selected tab isn't completely visible in the scrolled view,
  // force scroll
  const {
    parentHeight,
    selectedBottom,
    selectedTop,
  } = getNodePositions(event.target.parentNode, event.target);
  const shouldScrollDown = selectedBottom > parentHeight;
  const shouldScrollUp = selectedTop < 0;

  if (!shouldScrollDown && !shouldScrollUp) return;

  if (shouldScrollDown) {
    event.target.scrollIntoView(false);
  } else if (shouldScrollUp) {
    event.target.scrollIntoView(true);
  }
}

export function navigateResults(direction) {
  if (document.activeElement.nodeName === 'INPUT') {
    document.querySelector('.tab-object').focus();
    return;
  }

  switch (direction) {
    case 'Tab':
    case 'ArrowRight':
    case 'ArrowDown': {
      const nextSibling = document.activeElement.nextElementSibling;
      if (nextSibling) {
        nextSibling.focus();
      } else {
        // Return to top if next !exist
        tabList.querySelector('.tab-object').focus();
      }
      break;
    }
    case 'ArrowLeft':
    case 'ArrowUp': {
      const prevSibling = document.activeElement.previousElementSibling;
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

// Function for initializing the lists
// Later when we add recently-closed tabs and history, this is where we
// interpret the currently configured settings
export function populateTabList(store) {
  const { getState, currentWindowId } = store;
  const { searchAllWindows } = getState().settings;
  const { loadedTabs } = getState().tabs;
  const tabs = searchAllWindows
    ? loadedTabs
    : loadedTabs.filter(({ windowId }) => windowId === currentWindowId);
  injectTabsInList(tabs);
  return store;
}

export function deleteTab(tabId) {
  // Save the next element to save
  const elementToRemove = [...tabList.childNodes].find(
    // eslint-disable-next-line eqeqeq
    ({ dataset }) => dataset.id == tabId,
  );
  browser.tabs.remove(tabId);
  // Cache the deleted tabId since the current store passed into configureSearch
  // isn't updated with the latest tabs after tab deletion`
  deletedTabsCache().push(tabId);
  tabList.removeChild(elementToRemove);
  setTimeout(() => searchInput.focus(), 150);
}
