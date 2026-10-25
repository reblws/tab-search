// A sample of the popup, redrawn from the settings whenever they change
import { el, icon, clearChildNodes, CLOSE_ICON } from './element';

// Popup widths, as in POPUP_SIZE_PRESETS (popup/constants.js)
export const POPUP_WIDTHS = {
  small: 300,
  medium: 355,
  large: 420,
  xlarge: 500,
};

const TYPES = [
  ['tab', 'tabColor', 'Open tab'],
  ['other', 'otherWindowTabColor', 'Tab in another window'],
  ['recent', 'recentlyClosedTabColor', 'Recently closed'],
  ['bookmark', 'bookmarkColor', 'Bookmark'],
  ['history', 'historyColor', 'History'],
];

const sample = (title, url, letter, favicon, type, pinned = false) => ({
  title, url, letter, favicon, type, pinned,
});

const OPEN_TABS = [
  sample('Pull requests · reblws/tab-search', 'github.com/reblws/tab-search/pulls', 'G', '#24292f', 'tab', true),
  sample(
    'tabs.query() – WebExtensions JavaScript APIs reference and examples | MDN',
    'developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/query',
    'M', '#15141a', 'tab',
  ),
  sample('Team calendar — week of Oct 26', 'calendar.example.com/week', 'C', '#0b7a75', 'other'),
  sample('Fuse.js | Lightweight fuzzy-search library with zero dependencies', 'fusejs.io', 'F', '#b54708', 'tab'),
];
const BOOKMARK = sample('Add-on Developer Hub', 'addons.mozilla.org/developers', 'A', '#0060df', 'bookmark');
const HISTORY = sample('Migrate to Manifest V3', 'developer.chrome.com/docs/extensions/develop/migrate', 'C', '#1a56db', 'history');
const CLOSED = sample('Release notes draft', 'docs.example.com/release-notes', 'D', '#5b5b66', 'recent');

// The sample results the popup would list for these settings
export function previewItems(general) {
  const items = OPEN_TABS
    .filter(({ pinned }) => !(pinned && general.ignorePinnedTabs))
    .filter(({ type }) => type !== 'other' || general.searchAllWindows);
  if (general.showBookmarks) items.push(BOOKMARK);
  if (general.showHistory) items.push(HISTORY);
  if (general.showRecentlyClosed && general.recentlyClosedLimit > 0) {
    if (general.alwaysShowRecentlyClosedAtTheBottom) {
      items.push(CLOSED);
    } else {
      items.splice(1, 0, CLOSED);
    }
  }
  return items;
}

function itemNode(item, index, { general, color }) {
  const stripe = TYPES.find(([type]) => type === item.type)[1];
  const node = el(
    'li',
    { className: index === 0 ? 'preview__item is-selected' : 'preview__item' },
    el('span', { className: 'preview__favicon', 'aria-hidden': 'true' }, item.letter),
    el(
      'div',
      { className: 'preview__text' },
      el('div', { className: 'preview__title' }, item.title),
      general.tabUrlSize > 0 ? el('div', { className: 'preview__url' }, item.url) : null,
    ),
    general.showVisualDeleteTabButton
      ? el('span', { className: 'preview__close', 'aria-hidden': 'true' }, icon(CLOSE_ICON, 12, 2.6))
      : null,
  );
  node.style.borderLeftColor = color[stripe];
  node.firstChild.style.backgroundColor = item.favicon;
  return node;
}

export function renderPreview(state, tabCount) {
  const { general, color } = state;
  const width = POPUP_WIDTHS[general.popupSize] || POPUP_WIDTHS.medium;
  const popup = document.getElementById('preview-popup');
  const list = document.getElementById('preview-list');
  const badge = document.getElementById('preview-badge');
  const legend = document.getElementById('preview-legend');
  if (!popup) return;

  popup.style.width = `${width}px`;
  popup.style.fontFamily = general.useFallbackFont ? 'sans-serif' : '';
  popup.style.setProperty('--title-size', `${general.tabTitleSize}px`);
  popup.style.setProperty('--url-size', `${general.tabUrlSize}px`);
  popup.classList.toggle('is-one-line', general.oneLineTabTitles);
  const sizeValue = document.getElementById('popupSize-value');
  if (sizeValue) sizeValue.textContent = width;

  clearChildNodes(list);
  previewItems(general).forEach((item, i) => list.append(itemNode(item, i, state)));

  badge.hidden = !general.showTabCountBadgeText || tabCount === '';
  badge.textContent = tabCount;
  badge.style.backgroundColor = color.popupBadgeColor;

  clearChildNodes(legend);
  TYPES.forEach(([, key, label]) => {
    const swatch = el('span', { className: 'preview__legend-swatch', 'aria-hidden': 'true' });
    swatch.style.backgroundColor = color[key];
    legend.append(el('li', {}, swatch, label));
  });
  fitPopup(width);
}

// Shrinks the sample popup when it's wider than the preview column
export function fitPopup(width) {
  const popup = document.getElementById('preview-popup');
  const anchor = popup.parentElement;
  const label = document.getElementById('preview-width');
  const style = window.getComputedStyle(anchor);
  const room = anchor.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const scale = room > 0 ? Math.min(1, room / width) : 1;
  // Measure the popup at its natural height
  anchor.style.height = '';
  popup.style.transform = scale < 1 ? `scale(${scale})` : '';
  anchor.style.height = scale < 1
    ? `${popup.offsetHeight * scale + parseFloat(style.paddingTop)}px`
    : '';
  label.textContent = scale < 1
    ? `${width} px wide, shown at ${Math.floor(scale * 100)}%`
    : `${width} px wide`;
}

export function initPreview(store) {
  let tabCount = '';
  const render = () => renderPreview(store.getState(), tabCount);
  render();
  store.subscribe(render);
  window.addEventListener('resize', () => {
    fitPopup(POPUP_WIDTHS[store.getState().general.popupSize] || POPUP_WIDTHS.medium);
  });
  browser.tabs.query({}).then((tabs) => {
    tabCount = tabs.length;
    render();
  }).catch(() => {});
}
