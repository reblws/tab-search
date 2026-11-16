import { initialColorSettings } from 'core/reducers/defaults';
import { rowView, resultTypeLabel } from 'core/results/row';
import { scrollDirection } from 'core/results/list';
import { addTabListeners } from './side-effects';
import {
  favIconFallback,
  alertCircle,
  AUDIBLE_CLASSNAME,
  WORDBREAK_ALL_CLASSNAME,
  SELECTED_TAB_CLASSNAME,
  TAB_PIN_CLASSNAME,
  TAB_MUTED_CLASSNAME,
  TAB_ACTIVE_ID,
  TAB_DELETE_BTN_CLASSNAME,
} from './classnames';
import { tabList, searchInput } from './nodes';
import { badFavIconCache } from 'shell/cache/seen-sets';
import { configureSvg } from './assets';

const changeHeadTabListNodeSelectedStyle = method => () => {
  tabList().firstElementChild.classList[method](SELECTED_TAB_CLASSNAME);
};

export const removeHeadTabListNodeSelectedStyle =
  changeHeadTabListNodeSelectedStyle('remove');

export const addHeadTabListNodeSelectedStyle =
  changeHeadTabListNodeSelectedStyle('add');

export function isTabListEmpty() {
  return !tabList().firstElementChild.classList.contains('tab-object');
}

function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function inlineOpts(setting) {
  return Object.keys(initialColorSettings).reduce((acc, c) => {
    if (setting[c] === initialColorSettings[c]) {
      return acc;
    }
    return Object.assign({ [c]: setting[c] }, acc);
  }, {});
}

const TITLE_WRAP_CLASSNAMES = { breakAll: WORDBREAK_ALL_CLASSNAME, nowrap: 'nowrap' };

export function tabToTag(getState) {
  const { color: colorSettings, general } = getState();
  const assets = configureSvg(inlineOpts(colorSettings));
  const icons = {
    history: assets.historySvg,
    bookmark: assets.bookmarkSvg,
    fallback: favIconFallback,
  };
  return tab => createTabObject(rowView(tab, general, { icons, badFavIcons: badFavIconCache() }));
}

function textNode(tag, className, { text, fontSize }) {
  const node = document.createElement(tag);
  node.classList.add(className);
  node.appendChild(document.createTextNode(text));
  if (fontSize !== null) node.style = `font-size: ${fontSize}px`;
  return node;
}

// Builds a result row from core/results/row.js's rowView
function createTabObject(view) {
  const tabObjectNode = document.createElement('div');
  tabObjectNode.setAttribute('tabindex', '0');
  tabObjectNode.classList.add('tab-object', view.type);
  Object.assign(tabObjectNode.dataset, view.dataset);

  const iconContainerNode = document.createElement('div');
  iconContainerNode.classList.add('tab-img');
  const favIconNode = document.createElement('img');
  favIconNode.setAttribute('src', view.iconSrc);
  favIconNode.alt = '';
  favIconNode.addEventListener('error', handleBadSvg);
  iconContainerNode.appendChild(favIconNode);

  const typeBadge = document.createElement('span');
  typeBadge.className = 'tab-type-badge';
  const typeDot = document.createElement('span');
  typeDot.className = 'tab-type-dot';
  typeDot.setAttribute('aria-hidden', 'true');
  const typeLabel = document.createElement('span');
  typeLabel.className = 'tab-type-label';
  typeLabel.id = `tab-type-${encodeURIComponent(view.type)}-${encodeURIComponent(view.dataset.id)}`;
  typeLabel.setAttribute('role', 'tooltip');
  typeLabel.textContent = view.typeLabel;
  tabObjectNode.setAttribute('aria-describedby', typeLabel.id);
  typeBadge.append(typeDot, typeLabel);
  // Keep a short grace period between the small dot and its wider label.
  // This also avoids relying on cross-element :hover hit testing in Firefox.
  let hideTypeLabel;
  const showTypeLabel = () => {
    clearTimeout(hideTypeLabel);
    if (!typeBadge.classList.contains('is-dismissed')) typeBadge.classList.add('is-type-hovered');
  };
  const scheduleHideTypeLabel = () => {
    clearTimeout(hideTypeLabel);
    hideTypeLabel = setTimeout(() => {
      typeBadge.classList.remove('is-type-hovered', 'is-dismissed');
    }, 150);
  };
  [typeBadge, typeLabel].forEach((node) => {
    node.addEventListener('pointerenter', showTypeLabel);
    node.addEventListener('pointerleave', scheduleHideTypeLabel);
  });
  iconContainerNode.appendChild(typeBadge);

  const tabInfoNode = document.createElement('div');
  tabInfoNode.setAttribute('class', 'tab-info');
  const titleNode = textNode('div', 'tab-title', view.title);
  if (view.title.wrap) titleNode.classList.add(TITLE_WRAP_CLASSNAMES[view.title.wrap]);
  const titleLine = document.createElement('div');
  titleLine.className = 'tab-title-line';
  titleLine.appendChild(titleNode);
  tabInfoNode.appendChild(titleLine);
  if (view.url) tabInfoNode.appendChild(textNode('p', 'tab-url', view.url));

  tabObjectNode.appendChild(iconContainerNode);
  tabObjectNode.appendChild(tabInfoNode);

  // Appended after tabInfoNode so it sits on the right in flex layout
  if (view.deleteButton) {
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.title = 'Close Tab';
    delBtn.setAttribute('aria-label', `Close tab: ${view.title.text}`);
    delBtn.classList.add(TAB_DELETE_BTN_CLASSNAME);
    // Acorn's close-16, as in the search box's clear button. A literal, so
    // AMO's linter doesn't flag the innerHTML assignment
    delBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M14 3.06 9.06 8 14 12.938 12.94 14 8 9.06 3.062 14 2 12.94 6.938 8 2 3.062 3.06 2 8 6.939 12.939 2z"/>
    </svg>`;
    tabObjectNode.appendChild(delBtn);
  }
  tabObjectNode.classList.toggle(TAB_PIN_CLASSNAME, view.pinned);
  tabObjectNode.classList.toggle(AUDIBLE_CLASSNAME, view.audible);
  tabObjectNode.classList.toggle(TAB_MUTED_CLASSNAME, view.muted);
  if (view.active) {
    tabObjectNode.id = TAB_ACTIVE_ID;
    const current = document.createElement('span');
    current.className = 'tab-current';
    current.textContent = 'Current';
    titleLine.appendChild(current);
  }
  return tabObjectNode;
}

export function dismissTypeHint() {
  const badge = tabList().querySelector('.tab-type-badge.is-type-hovered:not(.is-dismissed)');
  if (!badge) return false;
  badge.classList.add('is-dismissed');
  return true;
}

function handleBadSvg(event) {
  badFavIconCache().add(event.currentTarget.src);
  event.currentTarget.src = favIconFallback;
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
  noResultNode.id = 'no-result';
  return noResultNode;
}

export function injectTabsInList(getState) {
  return function doInjectTabsInList(tabArray) {
    // Build map of existing nodes by id for reuse
    const existingNodes = new Map();
    Array.from(tabList().querySelectorAll('.tab-object')).forEach((node) => {
      existingNodes.set(node.dataset.id, node);
    });

    const wasNoResult = existingNodes.size === 0;
    const showNoResult = tabArray.length === 0;

    // Don't update dom if we're going to show no results again
    if (wasNoResult && showNoResult) return tabArray;

    if (showNoResult) {
      clearChildren(tabList());
      tabList().appendChild(createNoResult());
      return tabArray;
    }

    // Build new node list, reusing existing where possible
    const fragment = document.createDocumentFragment();
    tabArray.forEach((tab) => {
      const id = String(tab.sessionId || tab.id);
      if (existingNodes.has(id)) {
        fragment.appendChild(existingNodes.get(id));
      } else {
        const node = tabToTag(getState)(tab);
        addTabListeners(getState)(node);
        fragment.appendChild(node);
      }
    });

    clearChildren(tabList());
    tabList().appendChild(fragment);
    return tabArray;
  };
}

// If the focused row isn't completely visible in the list, scroll to it
export function scrollIfNeeded(event) {
  const direction = scrollDirection(getNodePositions(event.target.parentNode, event.target));
  if (direction) event.target.scrollIntoView(direction === 'up');
}

// deleteTab moves the focus first, when the row had it
export function removeElementFromTabList(element) {
  if (element.parentNode) element.parentNode.removeChild(element);
}

// Changes both the type classname (for styling)
// and the type prop in the dataset
export function repaintElementWithType(element, typeToAdd) {
  const { type: typeToRemove } = element.dataset;
  element.classList.remove(typeToRemove);
  element.classList.add(typeToAdd);
  element.dataset.type = typeToAdd;
  const label = element.querySelector('.tab-type-label');
  if (label) label.textContent = resultTypeLabel(typeToAdd);
  if (typeToAdd === 'session') {
    element.querySelector('.tab-current')?.remove();
    element.querySelector(`.${TAB_DELETE_BTN_CLASSNAME}`)?.remove();
    element.classList.remove(TAB_PIN_CLASSNAME, AUDIBLE_CLASSNAME, TAB_MUTED_CLASSNAME);
    if (element.id === TAB_ACTIVE_ID) element.removeAttribute('id');
  }
}

// Function for initializing the lists
export function populateTabList(search) {
  return Promise.resolve(search).then(injectTabsInList);
}

export function overrideFontStylesWithSansSerif() {
  const elementStylesToOverride = [
    document.body,
    document.querySelector('.search'),
  ];
  elementStylesToOverride.forEach((element) => {
    element.style = 'font-family: sans-serif;';
  });
}

export function appendSearchInputPlaceholderText(newText) {
  searchInput().placeholder += ` ${newText}`;
}

export function selectNodeText(nodeToCopy) {
  const range = document.createRange();
  range.selectNode(nodeToCopy);
  const selection = window.getSelection();
  // Chrome ignores addRange() while another range (e.g. the search input's)
  // is selected
  selection.removeAllRanges();
  selection.addRange(range);
}

// This is dependent on the popup css file being called "index.css" exactly
const popupCssStyleSheet = () =>
  [...document.styleSheets].find(s => /index.css$/.test(s.href));

export function setStyleSheetRule(selectorName, key, value) {
  const rules = popupCssStyleSheet().cssRules;
  const rule = [...rules].find(r => r.selectorText === selectorName);
  if (!rule) {
    console.error(`Can't find CSS Selector ${selectorName}`);
    return;
  }
  rule.style.setProperty(key, value);
}
