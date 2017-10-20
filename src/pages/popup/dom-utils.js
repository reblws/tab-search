import { addTabListeners } from './event-listeners';
import {
  favIconFallback,
  alertCircle,
  tabList,
  searchInput,
} from './constants';
import { badFavIconCache, deletedTabsCache } from './caches';

const d = document;

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

export function tabToTag({ favIconUrl, title, id, url, type, sessionId }) {
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
    type,
    sessionId,
  });
}

function createTabObject({
  id,
  sessionId,
  type,
  url,
  tabTitle,
  favIconLink,
}) {
  const dataId = type === 'session' ? sessionId : id;

  // Create the parent div
  // <div class="tab-object" data-id="${id}" tabIndex="0">
  const tabObjectNode = d.createElement('div');
  tabObjectNode.setAttribute('tabindex', '0');
  tabObjectNode.classList.add('tab-object');
  if (type === 'session') {
    tabObjectNode.classList.add('recently-closed-tab');
  }
  // Declare id used for switching
  tabObjectNode.setAttribute('data-id', dataId);
  // Declare data type
  tabObjectNode.setAttribute('data-type', type);

  // <img src="${favIconLink}">
  const favIconNode = d.createElement('img');
  favIconNode.setAttribute('src', favIconLink);
  favIconNode.onerror = handleBadSvg;

  // tab-info
  //    <div class="tab-info">
  const tabInfoNode = d.createElement('div');
  tabInfoNode.setAttribute('class', 'tab-info');

  //      <strong>${title}</strong>
  const titleNode = d.createElement('div');
  titleNode.classList.add('tab-title');
  titleNode.appendChild(d.createTextNode(tabTitle));

  //      <p>${url}</p>
  const urlNode = d.createElement('p');
  urlNode.appendChild(d.createTextNode(url));

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
  const noResultNode = d.createElement('div');
  noResultNode.classList.add('no-result');

  const alertCircleNode = d.createElement('object');
  alertCircleNode.classList.add('no-result__circle');
  alertCircleNode.setAttribute('type', 'image/svg+xml');
  alertCircleNode.setAttribute('data', alertCircle);

  const strongMsgNode = d.createElement('strong');
  strongMsgNode.classList.add('no-result__msg');
  strongMsgNode.appendChild(d.createTextNode('No tabs found'));

  noResultNode.appendChild(alertCircleNode);
  noResultNode.appendChild(strongMsgNode);
  return noResultNode;
}

export function injectTabsInList(tabArray) {
  const wasNoResult = tabList.querySelectorAll('.tab-object').length === 0;
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
  if (d.activeElement.nodeName === 'INPUT') {
    d.querySelector('.tab-object').focus();
    return;
  }

  switch (direction) {
    case 'Tab':
    case 'ArrowRight':
    case 'ArrowDown': {
      const nextSibling = d.activeElement.nextElementSibling;
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

// Function for initializing the lists
export function populateTabList(store) {
  const { loadedTabs } = store;
  injectTabsInList(loadedTabs);
  return store;
}

export function deleteTab(tabId, wasClicked = false) {
  // Save the next element to save
  const elementToRemove = [...tabList.childNodes].find(
    // eslint-disable-next-line eqeqeq
    ({ dataset }) => dataset.id == tabId,
  );
  const nextElementToFocus = elementToRemove.nextSibling
    ? elementToRemove.nextSibling
    : elementToRemove.previousSibling;
  browser.tabs.remove(tabId);
  // Cache the deleted tabId since the current store passed into configureSearch
  // isn't updated with the latest tabs after tab deletion`
  deletedTabsCache().push(tabId);
  tabList.removeChild(elementToRemove);
  if (!wasClicked) {
    nextElementToFocus.focus();
  }
}
