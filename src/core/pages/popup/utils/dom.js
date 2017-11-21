import { initialGeneralSettings } from 'core/reducers/defaults';
import { addTabListeners } from '../side-effects';
import {
  favIconFallback,
  alertCircle,
  tabList,
  searchInput,
  d,
  WORDBREAK_ALL_CLASSNAME,
  SELECTED_TAB_CLASSNAME,
  BOOKMARKS_SVG_PATH,
  BOOKMARK_TYPE,
} from '../constants';
import { badFavIconCache } from '../caches';

const changeHeadTabListNodeSelectedStyle = method => () => {
  tabList.firstElementChild.classList[method](SELECTED_TAB_CLASSNAME);
};

export const removeHeadTabListNodeSelectedStyle =
  changeHeadTabListNodeSelectedStyle('remove');

export const addHeadTabListNodeSelectedStyle =
  changeHeadTabListNodeSelectedStyle('add');


export function isTabListEmpty() {
  return !tabList.firstElementChild.classList.contains('tab-object');
}

// Save the default values for font sizes so we know when to inline the font
// sizes when we append tab nodes
const {
  tabUrlSize: defaultTabUrlSize,
  tabTitleSize: defaultTabTitleSize,
} = initialGeneralSettings;

// Store all the bad favIcons so we don't get loading jank if a favIcon !exist
function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

// Given a string, return true if one string is too long and should apply
function shouldWordBreak(str) {
  const MAX_LENGTH = 40;
  // eslint-disable-next-line arrow-body-style
  const longestWordLength = (acc, s) => s.length > acc
    ? s.length
    : acc;
  const longest = str.split(/\s/).reduce(longestWordLength, 0);
  return longest > MAX_LENGTH;
}

export function tabToTag(getState) {
  const {
    tabUrlSize,
    tabTitleSize,
  } = getState().general;
  return function doCreateTabObject(tab) {
    const {
      favIconUrl,
      title,
      id,
      url,
      type,
      sessionId,
      windowId,
    } = tab;
    const isValidFavIconUrl = favIconUrl
      && !badFavIconCache().includes(favIconUrl);
    // Since favicon url of bookmarks isn't readily available,
    // check the type and assign all bookmarks to the static svg
    // for now.
    let favIconLink;
    if (type !== BOOKMARK_TYPE) {
      favIconLink = isValidFavIconUrl
        ? favIconUrl
        : favIconFallback;
    } else {
      favIconLink = BOOKMARKS_SVG_PATH;
    }
    return createTabObject({
      id,
      url,
      title,
      favIconLink,
      type,
      sessionId,
      windowId,
      tabUrlSize,
      tabTitleSize,
    }, shouldWordBreak(title));
  };
}

function createTabObject({
  id,
  sessionId,
  type,
  url,
  title,
  favIconLink,
  windowId,
  lastAccessed,
  tabUrlSize,
  tabTitleSize,
}, wordBreak) {
  const dataId = sessionId || id;
  // Create the parent div
  // <div class="tab-object" data-id="${id}" tabIndex="0" data-type="tab" data-window="1">
  const tabObjectNode = d.createElement('div');
  tabObjectNode.setAttribute('tabindex', '0');
  tabObjectNode.classList.add('tab-object');
  tabObjectNode.classList.add(type);
  // Declare id used for switching
  tabObjectNode.setAttribute('data-id', dataId);
  // Declare data type to know what to paint
  tabObjectNode.setAttribute('data-type', type);
  // Add window id
  tabObjectNode.setAttribute('data-window', windowId);
  // Add url
  tabObjectNode.setAttribute('data-url', url);
  // Add lastaccessed
  tabObjectNode.setAttribute('data-last-accessed', lastAccessed);

  // <img src="${favIconLink}">
  const favIconNode = d.createElement('img');
  favIconNode.setAttribute('src', favIconLink);
  favIconNode.onerror = handleBadSvg;

  // tab-info
  //    <div class="tab-info">
  const tabInfoNode = d.createElement('div');
  tabInfoNode.setAttribute('class', 'tab-info');

  //      <strong>${title}</strong>
  // INLINE tabTitleSize HERE
  const titleNode = d.createElement('div');
  titleNode.classList.add('tab-title');
  if (wordBreak) {
    titleNode.classList.add(WORDBREAK_ALL_CLASSNAME);
  }
  titleNode.appendChild(d.createTextNode(title));
  if (tabTitleSize !== defaultTabTitleSize) {
    titleNode.style = `font-size: ${tabTitleSize}px`;
  }

  //      <p>${url}</p>
  // INLINE tabUrlSize HERE
  const urlNode = d.createElement('p');
  urlNode.classList.add('tab-url');
  urlNode.appendChild(d.createTextNode(url));
  if (tabUrlSize !== defaultTabUrlSize) {
    urlNode.style = `font-size: ${tabUrlSize}px`;
  }

  // Append all block elementshttps://cloud.githubusercontent.com/assets/689327/26164874/6c2b8920-3b04-11e7-8d4e-f1db027cb4a2.jpg
  tabInfoNode.appendChild(titleNode);
  // Don't show the url if user specifies 0 as the url font size
  if (tabUrlSize > 0) {
    tabInfoNode.appendChild(urlNode);
  }

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

export function injectTabsInList(getState) {
  return function doInjectTabsInList(tabArray) {
    const wasNoResult = tabList.querySelectorAll('.tab-object').length === 0;
    const showNoResult = tabArray.length === 0;
    // Don't update dom if we're going to show no results again
    if (wasNoResult && showNoResult) return tabArray;

    clearChildren(tabList);

    // Add nodes to tabList & attach event listeners
    if (showNoResult) {
      tabList.appendChild(createNoResult());
    } else {
      tabArray.map(tabToTag(getState)).forEach((tabNode) => {
        addTabListeners(getState)(tabNode);
        tabList.appendChild(tabNode);
      });
    }
    return tabArray;
  };
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



export function removeElementFromTabList(element, wasClicked) {
  const nextElementToFocus = element.nextSibling
    ? element.nextSibling
    : element.previousSibling;
  tabList.removeChild(element);
  if (!wasClicked) {
    nextElementToFocus.focus();
  }
}

export function repaintElementWithType(element, typeToAdd) {
  const { type: typeToRemove } = element.dataset;
  element.classList.remove(typeToRemove);
  element.classList.add(typeToAdd);
  element.dataset.type = typeToAdd;
}

// Function for initializing the lists
export function populateTabList(search) {
  return Promise.resolve(search).then(injectTabsInList);
}

export function overrideFontStylesWithSansSerif() {
  const elementStylesToOverride = [
    d.body,
    d.querySelector('.search'),
  ];
  elementStylesToOverride.forEach((element) => {
    element.style = 'font-family: sans-serif;';
  });
}

export function appendSearchInputPlaceholderText(newText) {
  // eslint-disable-next-line prefer-template
  searchInput.placeholder += ' ' + newText;
}

export function selectNodeText(nodeToCopy) {
  const range = d.createRange();
  range.selectNode(nodeToCopy);
  window.getSelection().addRange(range);
}
