const searchInput = document.querySelector('input[type="search"]');
const tabList = document.querySelector('.tab-list');

// Initialize tabs
{
  getAllTabs().then(injectTabsInList);
}
// Set a timeout on focus so input is focused on popup
setTimeout(() => searchInput.focus(), 100);
// Any keydown should activate the search field,
// TODO: on arrow keys ignore focus and switch tab index
window.addEventListener('keydown', handleKeyDown);
tabList.addEventListener('click', switchTabs);
searchInput.addEventListener('change', updateSearch);
searchInput.addEventListener('keyup', updateSearch);

function handleKeyDown(event) {
  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      document.activeElement.nextElementSibling.focus();
      // navigateResults(1);
      break;
    case "ArrowLeft":
    case "ArrowUp":
      document.activeElement.previousElementSibling.focus();
      break;
    case "Enter":
      if (document.activeElement.nodeName === "INPUT") {
        document.querySelector('.tab-link').focus();
      }
      switchTabs(document.activeElement.dataset.id)
      break;
    default:
      searchInput.focus();
      break;
  }
}

function navigateResults(number) {
  const active = document.activeElement;
  switch (activeElement) {
    case "INPUT":
      document.querySelector('.selected').focus();
      const newTab = document.activeElement.dataset.id;
      switchActiveTab(newTab);
      break;
    default:
      break;
  }
}

function getAllTabs() {
  return browser.tabs.query({ currentWindow: true });
}

function updateSearch(event) {
  const query = event.target.value.toLowerCase();
  const tabFilter = tab => tab.title.toLowerCase().includes(query);
  return getAllTabs()
    .then(tabArray => tabArray.filter(tabFilter))
    .then(injectTabsInList);
}

function injectTabsInList(tabArray) {
  tabList.innerHTML = tabArray.map(tabToTag).join('');
}

function tabToTag(tab, index) {
  const className = 'tab-link';
    // index === 0
    // ? 'tab-link selected'
    // : 'tab-link';
  return `
    <a class="tab-link" class="${className}" data-href="${tab.url}" data-id="${tab.id}" href="#">
      ${tab.title}
    </a>
  `;
}

function switchTabs(event) {
  if (event.target.className !== 'tab-link') return;
  event.preventDefault();
  const tabId = parseInt(event.target.dataset.id);
  switchActiveTab(tabId);
}

function switchActiveTab(id) {
  browser.tabs.update(id, { active: true });
  window.close();
}

// To switch tabs
// onClick -> tabs.update(tab.id, { active: true })
