import { initialGeneralSettings } from '../reducers/defaults';
import { shouldWordBreak } from '../lib/word-break';
import {
  BOOKMARK_TYPE,
  HISTORY_TYPE,
  OTHER_WINDOW_TAB_TYPE,
  TAB_TYPE,
} from '../tabs/types';

const {
  tabUrlSize: defaultUrlSize,
  tabTitleSize: defaultTitleSize,
} = initialGeneralSettings;

// Font sizes are only inlined when they differ from the stylesheet's
const fontSize = (size, defaultSize) => (size === defaultSize ? null : size);

// Bookmarks and history items have no favicon at hand, so they get the
// static icons; a favicon that failed to load before gets the fallback
function iconSrc({ type, favIconUrl }, icons, badFavIcons) {
  if (type === HISTORY_TYPE) return icons.history;
  if (type === BOOKMARK_TYPE) return icons.bookmark;
  return favIconUrl && !badFavIcons.has(favIconUrl) ? favIconUrl : icons.fallback;
}

// Everything a result row shows, as plain values, for the popup to build.
// icons: { history, bookmark, fallback } image sources
// badFavIcons: the favicon URLs that failed to load
export function rowView(tab, settings, { icons, badFavIcons }) {
  const {
    tabUrlSize,
    tabTitleSize,
    showVisualDeleteTabButton,
    oneLineTabTitles,
  } = settings;
  const {
    id, sessionId, type, url, title, windowId, lastAccessed,
  } = tab;
  let titleWrap = null;
  if (oneLineTabTitles) titleWrap = 'nowrap';
  else if (shouldWordBreak(title)) titleWrap = 'breakAll';
  return {
    type,
    dataset: {
      id: String(sessionId || id),
      type,
      window: String(windowId),
      url: String(url),
      lastAccessed: String(lastAccessed),
    },
    iconSrc: iconSrc(tab, icons, badFavIcons),
    title: { text: title, wrap: titleWrap, fontSize: fontSize(tabTitleSize, defaultTitleSize) },
    // A url font size of 0 hides the url
    url: tabUrlSize > 0 ? { text: url, fontSize: fontSize(tabUrlSize, defaultUrlSize) } : null,
    deleteButton: !!showVisualDeleteTabButton
      && (type === TAB_TYPE || type === OTHER_WINDOW_TAB_TYPE),
    pinned: !!tab.pinned,
    audible: !!tab.audible,
    muted: !!(tab.mutedInfo && tab.mutedInfo.muted),
    active: !!tab.isActive,
  };
}
