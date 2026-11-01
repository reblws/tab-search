import { TAB_TYPE, OTHER_WINDOW_TAB_TYPE } from './types';

const isOpenTab = ({ type }) => type === TAB_TYPE || type === OTHER_WINDOW_TAB_TYPE;

const recency = ({ lastAccessed }) => {
  const time = Number(lastAccessed);
  return Number.isFinite(time) ? time : -Infinity;
};

// Indexes of the open tabs in `items` to close so each URL is left with one
// tab: the most recently used, or the first listed when the times tie.
// Recently closed tabs, bookmarks and history items are never closed.
// items: [{ type, url, lastAccessed }]
export function findDuplicateTabs(items) {
  const keepByUrl = items.reduce((keep, item, index) => {
    if (!isOpenTab(item)) return keep;
    const kept = keep.get(item.url);
    if (kept === undefined || recency(item) > recency(items[kept])) {
      return new Map(keep).set(item.url, index);
    }
    return keep;
  }, new Map());
  return items
    .map((item, index) => index)
    .filter(index => isOpenTab(items[index])
      && keepByUrl.get(items[index].url) !== index);
}
