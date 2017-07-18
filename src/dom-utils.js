import {
  favIconFallback,
  alertCircle,
  tabList,
  searchInput,
} from './constants';
// Store all the bad favIcons so we don't get loading jank if a favIcon !exist
function badFavIconCache() {
  const badIconCache = [];
  return () => badIconCache;
}

function initializeTabs() {
  const tabs = browser.tabs.query({ currentWindow: true });
  return () => tabs;
}

const badFavIcons = badFavIconCache();
export const getAllTabs = initializeTabs();

function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function isChromeLink(src) {
  return /chrome:\/\//.test(src);
}

function isURL(src) {
  return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(src);
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

function switchTabs() {
  // this: should be the tab-object node
  const tabId = this.dataset.id;
  switchActiveTab(tabId);
}

export function clearInput(node) {
  node.value = '';
}

export function populateTabList() {
  getAllTabs().then(injectTabsInList);
}

export function tabToTag({ favIconUrl, title, id, url }) {
  const isValidFavIconUrl = favIconUrl
    && !isChromeLink(favIconUrl)
    && !badFavIcons().includes(favIconUrl);
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
  const titleNode = document.createElement('strong');
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
  badFavIcons().push(this.src);
  this.src = favIconFallback;
}

// Get focused node's position relative to the current scrolled view
export function getNodePositions(parentNode, selectedNode) {
  return {
    parentHeight: parentNode.offsetHeight,
    selectedBottom: selectedNode.offsetHeight + (
      selectedNode.offsetTop - parentNode.offsetTop
    ) - parentNode.scrollTop,
    selectedTop: (
      selectedNode.offsetTop - parentNode.offsetTop
    ) - parentNode.scrollTop,
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
  alertCircleNode.setAttribute('type', 'image/svg+xml');
  alertCircleNode.setAttribute('data', alertCircle);

  const strongMsgNode = document.createElement('strong');
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
      tabNode.addEventListener('click', switchTabs, true);
      tabNode.addEventListener('focus', scrollIfNeeded);
      tabList.appendChild(tabNode);
    });
  }
}

function scrollIfNeeded(event) {
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

