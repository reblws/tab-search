import { planNavigation, SEARCH } from 'core/navigation/plan';
import {
  reloadTab,
  pinTab,
  queryTab,
  muteTab,
} from 'shell/platform/tabs';
import { deleteTab } from './tab-actions';
import {
  removeHeadTabListNodeSelectedStyle,
  selectNodeText,
} from './render';
import {
  NO_RESULT_CLASSNAME,
  TAB_URL_CLASSNAME,
  TAB_MUTED_CLASSNAME,
  TAB_PIN_CLASSNAME,
  RELOAD_SVG_PATH,
} from './classnames';
import { tabList, searchInput } from './nodes';

// The values planNavigation decides on, read off the result list. Focus
// outside the list (-1) counts as the search input having it.
function readView(rows) {
  return {
    items: rows.map(row => row.dataset),
    focused: rows.indexOf(document.activeElement),
    noResults: !!document.getElementById(NO_RESULT_CLASSNAME) || rows.length === 0,
  };
}

function focus(target, rows) {
  removeHeadTabListNodeSelectedStyle();
  (target === SEARCH ? searchInput() : rows[target]).focus();
}

function reload(row) {
  const img = row.querySelector('.tab-img img');
  const originalSrc = img.src;
  img.setAttribute('src', RELOAD_SVG_PATH);
  reloadTab(row.dataset.id).then(() => {
    setTimeout(() => { img.setAttribute('src', originalSrc); }, 500);
  });
}

function togglePin(row) {
  const { id } = row.dataset;
  queryTab(id)
    .then(({ pinned }) => pinTab(id, !pinned))
    .then(({ pinned }) => row.classList.toggle(TAB_PIN_CLASSNAME, pinned));
}

// A muted tab that plays sound is still audible, so toggle mutedInfo
function toggleMute(row) {
  const { id } = row.dataset;
  queryTab(id)
    .then(({ mutedInfo }) => muteTab(id, !mutedInfo.muted))
    .then(({ mutedInfo }) => row.classList.toggle(TAB_MUTED_CLASSNAME, mutedInfo.muted));
}

function copyUrl(row) {
  selectNodeText(row.querySelector(`.${TAB_URL_CLASSNAME}`));
  document.execCommand('copy');
}

// Gathers the list's state, lets core decide, then applies the plan
export function navigateResults(cmdKey, getState) {
  const rows = [...tabList().children];
  const plan = planNavigation(cmdKey, readView(rows));
  if (!plan) return undefined;
  const [[effect, target]] = Object.entries(plan);
  switch (effect) {
    case 'focus': return focus(target, rows);
    case 'close': return target.forEach(i => deleteTab(rows[i], getState().general));
    case 'open': return rows[target].click();
    case 'reload': return reload(rows[target]);
    case 'pin': return togglePin(rows[target]);
    case 'mute': return toggleMute(rows[target]);
    case 'copyUrl': return copyUrl(rows[target]);
    default: return undefined;
  }
}
