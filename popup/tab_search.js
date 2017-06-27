// Want to display all tabs

const searchBar = document.querySelector('input');
const tabList = document.querySelector('.tab-list');
const tabPromise = getAllTabs().then(injectTabsInList);

tabList.addEventListener('click', switchTabs);

function getAllTabs() {
  return browser.tabs.query({});
}

function injectTabsInList(tabArray) {
  tabList.innerHTML = tabArray.map(tabToTag).join('');
}

// Got to make this an onClick event that switches tab
function tabToTag(tab) {
  return `
    <li class="tab">
      <a class="tab-link" data-href="${tab.url}" data-key="${tab.id}">
        ${tab.title}
      </a>
    </li>
  `;
}

function switchTabs(event) {
  const tabId = parseInt(event.target.dataset.key);
  browser.tabs.update(tabId, { active: true });
}

// To switch tabs
// onClick -> tabs.update(tab.id, { active: true })
