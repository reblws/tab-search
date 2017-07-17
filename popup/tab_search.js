const deleteButton = document.querySelector('.delete-circle');
const searchInput = document.querySelector('.search');
const tabList = document.querySelector('.tab-list');

function initializeTabs() {
  const tabs = browser.tabs.query({ currentWindow: true });
  return () => tabs;
}

// Store all the bad favIcons so we don't get loading jank if a favIcon !exist
function badFavIconCache() {
  const badIconCache = [];
  return () => badIconCache;
}

const badFavIcons = badFavIconCache();
const getAllTabs = initializeTabs();

// Initialize tabs
populateTabList();

// Set a timeout on focus so input is focused on popup
document.addEventListener('DOMContentLoaded', () =>
  setTimeout(() => searchInput.focus(), 150)
);
// Any (non-navigating) keydown should activate the search field,
window.addEventListener('keydown', handleKeyDown);
searchInput.addEventListener('change', updateSearch);
searchInput.addEventListener('keyup', updateSearch);
deleteButton.addEventListener('click', clearInput);

function handleKeyDown(event) {
  switch (event.key) {
    case "Tab":
    case "ArrowDown":
    case "ArrowUp":
      event.preventDefault();
    case "ArrowRight":
    case "ArrowLeft":
      navigateResults(event.key);
      break;
    case "Enter":
      event.preventDefault();
      if (
        !document.activeElement.className.includes('tab-object')
        && !document.activeElement.className.includes('no-result')
      ) {
        tabList.childNodes[0].focus();
        setTimeout(() => switchActiveTab(document.activeElement.dataset.id), 150);
      } else {
        switchActiveTab(document.activeElement.dataset.id);
      }
      break;
    case "Escape":
      // This only works in chrome, in firefox it always closes the window
      if (searchInput.value.length === 0) {
        window.close();
      } else {
        clearInput();
      }
      break;
    default:
      searchInput.focus();
      break;
  }
}

function navigateResults(direction) {
  if (document.activeElement.nodeName === 'INPUT') {
    document.querySelector('.tab-object').focus();
    return;
  }

  switch (direction) {
    case 'Tab':
    case 'ArrowRight':
    case 'ArrowDown':
      const nextSibling = document.activeElement.nextElementSibling;
      if (nextSibling) {
        nextSibling.focus();
      } else {
        // Return to top if next !exist
        tabList.querySelector('.tab-object').focus();
      }
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      const prevSibling = document.activeElement.previousElementSibling;
      if (prevSibling) {
        prevSibling.focus()
      } else {
        searchInput.focus();
      };
      break;
  }
}

function injectTabsInList(tabArray) {
  const wasNoResult = tabList.querySelectorAll('.tab-object').length === 0;
  const showNoResult = tabArray.length === 0;
  // Don't update dom if we're going to show no results again
  if (wasNoResult && showNoResult) return;

  clearChildren(tabList);

  // Add nodes to tabList & attach event listeners
  if (showNoResult) {
    tabList.appendChild(noResultNode());
  } else {
    tabArray.map(tabToTag).forEach(tabNode => {
      tabNode.addEventListener('click', switchTabs, true);
      tabNode.addEventListener('focus', scrollIfNeeded);
      tabList.appendChild(tabNode);
    });
  }
}

function tabToTag({ favIconUrl, title, id, url }) {
  const fallBackSvg = '/assets/file.svg';
  const favIconLink = favIconUrl
    && !isChromeLink(favIconUrl)
    && !badFavIcons().includes(favIconUrl)
      ? favIconUrl
      : fallBackSvg;
  // Just check if it's a url for now so we can shorten it
  const tabTitle = isURL(title)
    ? getBasePath(title)
    : title;

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
  favIconNode.onerror = function(event) {
    badFavIcons().push(this.src);
    this.src = fallBackSvg;
  };

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

// Get focused node's position relative to the current scrolled view
function getNodePositions(parentNode, selectedNode) {
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

function noResultNode() {
  // <div class="no-result">
  //   <object type="image/svg+xml" data="/assets/alert-circle.svg"></object>
  //   <strong>No tabs found</strong>
  // </div>
  const noResultNode = document.createElement('div');
  noResultNode.classList.add('no-result');

  const alertCircleNode = document.createElement('object');
  alertCircleNode.setAttribute('type', 'image/svg+xml');
  alertCircleNode.setAttribute('data', '/assets/alert-circle.svg');

  const strongMsgNode = document.createElement('strong');
  strongMsgNode.appendChild(document.createTextNode('No tabs found'));

  noResultNode.appendChild(alertCircleNode);
  noResultNode.appendChild(strongMsgNode);
  return noResultNode;
}

function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  };
}

function shortenString(str) {
  return str.length >= 120
    ? str.slice(0, 90) + '...'
    : str;
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

function switchTabs() {
  // this: should be the tab-object node
  const tabId = this.dataset.id;
  switchActiveTab(tabId);
}

function switchActiveTab(id) {
  const numId = parseInt(id, 10);
  browser.tabs.update(numId, { active: true });
  window.close();
}

function clearInput() {
  searchInput.value = '';
  populateTabList();
}

function populateTabList() {
  getAllTabs().then(injectTabsInList);
}

function focusNode(node) {
  node.focus();
}

/*
  SEARCH
*/

function updateSearch(event) {
  // If input is empty hide the button
  if (searchInput.value.length === 0) {
    deleteButton.classList.add('hidden');
  } else {
    deleteButton.classList.remove('hidden');
  }

  const query = event.target.value.trim().toLowerCase();
  const getSearchResults = filterResults(query);
  return getAllTabs()
    .then(getSearchResults)
    .then(injectTabsInList);
}

function filterResults(query) {
  const searchUrl = queryInUrl(query);

  // TODO: Still need to do a strict match for url
  //  Should: Do a filter over strict url maatches
  //  THEN: they should jump to the top of the results,
  //      wrt to their same rankings relative rank to each
  //      other in the original Fuse search.
  //          -> Loop thru the fuse results,
  //              no loops needed, just filter both arrays,
  //              join them (filteredFuse first),
  const options = {
    shouldSort: true,
    // includeMatches: false,
    threshold: 0.7,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['title'],
  };
  const fuse = (array) => new Fuse(array, options);
  return (tabArray) => fuse(tabArray).search(query);
}

function queryInUrl(query) {
  return ({ url }) => url.toLowerCase().includes(query);
}
