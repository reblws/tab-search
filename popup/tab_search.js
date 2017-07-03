const searchInput = document.querySelector('.search');
const tabList = document.querySelector('.tab-list');

// Initialize tabs
{
  getAllTabs().then(injectTabsInList);
}
// Set a timeout on focus so input is focused on popup
setTimeout(() => {
  console.log('FOCUSED');
  searchInput.focus();
}, 100);

// Any keydown should activate the search field,
// TODO: on arrow keys ignore focus and switch tab index
window.addEventListener('keydown', handleKeyDown);
tabList.addEventListener('click', switchTabs);
searchInput.addEventListener('change', updateSearch);
searchInput.addEventListener('keyup', updateSearch);

function handleKeyDown(event) {
  console.log('key');
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
    default:
      searchInput.focus();
      break;
  }
}

function navigateResults(direction) {
  if (![...document.activeElement.classList].includes('tab-object')) {
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
      // TODO: return to top on else
      //        want to
      if (prevSibling) {
        prevSibling.focus()
      } else {
        searchInput.focus();
      };
      break;
  }
}

function getAllTabs() {
  return browser.tabs.query({ currentWindow: true });
}

function updateSearch(event) {
  const query = event.target.value.toLowerCase();
  const tabFilter = tab => {
    // Check if tab has the query in title, url
    const queryInTitle = tab.title.toLowerCase().includes(query);
    const queryInUrl = tab.url.toLowerCase().includes(query);
    return (queryInTitle);
  };
  return browser.tabs.query({ currentWindow: true })
    .then(tabArray => tabArray.filter(tabFilter))
    .then(injectTabsInList);
}

function injectTabsInList(tabArray) {
  const noResult = `
    <div class="tab-object no-result">
      <img class="svg" src="/assets/alert-circle.svg">
      <strong>No tabs found.</strong>
    </div>
  `;

  tabList.innerHTML = tabArray.length === 0
    ? noResult
    : tabArray.map(tabToTag).join('');
}

function tabToTag(tab, index) {
  const favIconLink = tab.favIconUrl
    ? tab.favIconUrl
    : '/assets/file.svg';
  return `
    <div class="tab-object" data-id="${tab.id}" tabIndex="0">
      <img src="${favIconLink}">
      <div class="tab-info">
        <strong>${tab.title}</strong>
        <p>${tab.url}</p>
      </div>
    </div>
  `;
}

function switchTabs(event) {
  if (event.target.className !== 'tab-object') return;
  event.preventDefault();
  switchActiveTab(tabId);
}

function switchActiveTab(id) {
  const numId = parseInt(id);
  browser.tabs.update(numId, { active: true });
  window.close();
}

function isNewTab(title) {
  return title !== 'New Tab';
}

// To switch tabs
// onClick -> tabs.update(tab.id, { active: true })
