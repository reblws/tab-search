const searchInput = document.querySelector('input[type="search"]');
const tabList = document.querySelector('.tab-list');
// Initialize window
// getAllTabs().then(injectTabsInList);

tabList.addEventListener('click', switchTabs);
searchInput.addEventListener('change', updateSearch);
searchInput.addEventListener('keyup', updateSearch);


function getAllTabs() {
  return browser.tabs.query({ currentWindow: true });
}

function updateSearch(event) {
  const query = event.target.value.toLowerCase();
  const tabFilter = tab => tab.title.includes(query);
  return getAllTabs()
    .then(tabArray => tabArray.filter(tabFilter))
    .then(injectTabsInList);
}

function injectTabsInList(tabArray) {
  tabList.innerHTML = tabArray.map(tabToTag).join('');
}

// Got to make this an onClick event that switches tab
function tabToTag(tab) {
  return `
    <li class="tab">
      <a class="tab-link" data-href="${tab.url}" data-id="${tab.id}" href="">
        ${tab.title}
      </a>
    </li>
  `;
}

function switchTabs(event) {
  if (event.target.className !== 'tab-link') return;
  event.preventDefault();
  const tabId = parseInt(event.target.dataset.id);
  browser.tabs.update(tabId, { active: true });
}

// To switch tabs
// onClick -> tabs.update(tab.id, { active: true })
