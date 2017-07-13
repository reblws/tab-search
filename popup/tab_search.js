const deleteButton = document.querySelector('.delete-circle');
const searchInput = document.querySelector('.search');
const tabList = document.querySelector('.tab-list');

function initializeTabs() {
  const tabs = browser.tabs.query({ currentWindow: true });
  return () => {
    return tabs;
  };
}

const getAllTabs = initializeTabs();

// Initialize tabs
populateTabList();
// Set a timeout on focus so input is focused on popup
setTimeout(() => {
  searchInput.focus();
}, 250);

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
      if (document.activeElement.nodeName === "INPUT") {
        tabList.querySelector('.tab-object').focus();
      }
      switchActiveTab(document.activeElement.dataset.id);
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
    case "Tab":
    case "ArrowRight":
    case "ArrowDown":
      const nextSibling = document.activeElement.nextElementSibling;
      if (nextSibling) {
        nextSibling.focus();
      } else {
        // Return to top if next !exist
        tabList.querySelector('.tab-object').focus();
      }
      break;
    case "ArrowLeft":
    case "ArrowUp":
      const prevSibling = document.activeElement.previousElementSibling;
      if (prevSibling) {
        prevSibling.focus()
      } else {
        searchInput.focus();
      };
      break;
  }
}

function updateSearch(event) {
  // If input is empty hide the button
  if (searchInput.value.length === 0) {
    deleteButton.classList.add('hidden');
  } else {
    deleteButton.classList.remove('hidden');
  }

  const query = event.target.value.toLowerCase();
  const tabFilter = (tab) => {
    // Check if tab has the query in title, url
    const queryInTitle = tab.title.toLowerCase().includes(query);
    const queryInUrl = tab.url.toLowerCase().includes(query);
    return (queryInTitle || queryInUrl);
  };
  return getAllTabs()
    .then(tabArray => tabArray.filter(tabFilter))
    .then(injectTabsInList);
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
    tabList.appendChild(tabNode);
    });
  }
}

function tabToTag({ favIconUrl, title, id, url }) {
  const fallBackSvg = '/assets/file.svg';
  const favIconLink = favIconUrl && !isChromeLink(favIconUrl)
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
    this.src = fallBackSvg;
  };

  // tab-info
  //    <div class="tab-info">
  //      <strong>${title}</strong>
  //      <p>${url}</p>
  //    </div>
  const tabInfoNode = document.createElement('div');
  tabInfoNode.setAttribute('class', 'tab-info');

  const titleNode = document.createElement('strong');
  titleNode.appendChild(document.createTextNode(tabTitle));

  const urlNode = document.createElement('p');
  urlNode.appendChild(document.createTextNode(url));

  tabInfoNode.appendChild(titleNode);
  tabInfoNode.appendChild(urlNode);

  tabObjectNode.appendChild(favIconNode);
  tabObjectNode.appendChild(tabInfoNode);

  return tabObjectNode;
}

function noResultNode() {
  // tab-info
  //    <div class="tab-info">
  //      <strong>${title}</strong>
  //      <p>${url}</p>
  //    </div>
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
  const url = new URL(src);
  return url.origin;
}

function switchTabs() {
  // this: should be the tab-object node
  const tabId = this.dataset.id;
  switchActiveTab(tabId);
}

function switchActiveTab(id) {
  const numId = parseInt(id);
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

// To switch tabs
// onClick -> tabs.update(tab.id, { active: true })
