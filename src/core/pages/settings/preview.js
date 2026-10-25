// Live preview: the real popup page in a frame, reloaded when a setting it
// reads changes. The popup reads its settings once, when it opens.
import debounce from 'debounce';
import { el, clearChildNodes } from './element';

export const PREVIEW_URL = '../popup/index.html?preview';
const RELOAD_DELAY = 150;
const READY_TIMEOUT = 2000;

const LEGEND = [
  ['tabColor', 'Open tab'],
  ['otherWindowTabColor', 'Tab in another window'],
  ['recentlyClosedTabColor', 'Recently closed'],
  ['bookmarkColor', 'Bookmark'],
  ['historyColor', 'History'],
];

// The parts of the state the popup reads; keyboard shortcuts don't show
const popupState = ({ general, fuzzy, color, state }) =>
  JSON.stringify({ general, fuzzy, color, state });

export function popupStateChanged(prev, next) {
  return popupState(prev) !== popupState(next);
}

// Toolbar badge and color legend beside the popup
export function renderToolbar(state, tabCount) {
  const { general, color } = state;
  const badge = document.getElementById('preview-badge');
  badge.hidden = !general.showTabCountBadgeText || tabCount === '';
  badge.textContent = tabCount;
  badge.style.backgroundColor = color.popupBadgeColor;

  const legend = document.getElementById('preview-legend');
  clearChildNodes(legend);
  LEGEND.forEach(([key, label]) => {
    const swatch = el('span', { className: 'preview__legend-swatch', 'aria-hidden': 'true' });
    swatch.style.backgroundColor = color[key];
    legend.append(el('li', {}, swatch, label));
  });
}

// Shrinks the popup when it's wider than the preview column
export function fitFrame(frame, width, popupWidth = width) {
  const anchor = document.getElementById('preview-anchor');
  const label = document.getElementById('preview-width');
  const style = window.getComputedStyle(anchor);
  const room = anchor.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const scale = room > 0 && width > 0 ? Math.min(1, room / width) : 1;
  frame.style.transform = scale < 1 ? `scale(${scale})` : '';
  anchor.style.height = scale < 1
    ? `${frame.offsetHeight * scale + parseFloat(style.paddingTop)}px`
    : '';
  label.textContent = scale < 1
    ? `${popupWidth} px wide, shown at ${Math.floor(scale * 100)}%`
    : `${popupWidth} px wide`;
}

// Resolves once the popup has drawn its list (or gives up after a while)
function whenListDrawn(frame) {
  const started = Date.now();
  return new Promise((resolve) => {
    (function check() {
      const list = frame.contentDocument?.querySelector('.tab-list');
      if (list?.firstElementChild || Date.now() - started > READY_TIMEOUT) {
        resolve();
      } else {
        setTimeout(check, 30);
      }
    }());
  });
}

function createFrame() {
  return el('iframe', {
    className: 'preview__frame',
    src: PREVIEW_URL,
    title: 'Popup preview',
    inert: true,
    tabindex: '-1',
  });
}

export function initPreview(store) {
  const anchor = document.getElementById('preview-anchor');
  let frame = null;
  // Frame width (the popup's body and its border) and the popup's own width
  let frameWidth = 0;
  let popupWidth = 0;
  let tabCount = '';
  let prevState = store.getState();

  // Loads the popup in a new frame over the current one and swaps them once
  // it has drawn, so the preview doesn't flash
  function load() {
    const next = createFrame();
    next.classList.add('is-loading');
    anchor.append(next);
    next.addEventListener('load', () => {
      whenListDrawn(next).then(() => {
        // The popup's body box; the frame's scroll size is at least its
        // current size, so it can't tell a smaller popup
        const { body } = next.contentDocument;
        const box = body.getBoundingClientRect();
        frameWidth = Math.ceil(box.right);
        popupWidth = parseFloat(window.getComputedStyle(body).width);
        next.style.width = `${frameWidth}px`;
        next.style.height = `${Math.ceil(box.bottom)}px`;
        if (frame) frame.remove();
        frame = next;
        frame.classList.remove('is-loading');
        fitFrame(frame, frameWidth, popupWidth);
      });
    }, { once: true });
  }
  const reload = debounce(load, RELOAD_DELAY);

  renderToolbar(prevState, tabCount);
  load();
  store.subscribe(() => {
    const state = store.getState();
    renderToolbar(state, tabCount);
    if (popupStateChanged(prevState, state)) reload();
    prevState = state;
  });
  window.addEventListener('resize', () => {
    if (frame) fitFrame(frame, frameWidth, popupWidth);
  });
  browser.tabs.query({}).then((tabs) => {
    tabCount = tabs.length;
    renderToolbar(store.getState(), tabCount);
  }).catch(() => {});
}
