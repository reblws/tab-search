import { SESSION_TYPE } from '../tabs/types';

// Which way to scroll so a focused row is fully in view, or null when it is.
// Positions are relative to the visible part of the list.
export function scrollDirection({ parentHeight, selectedTop, selectedBottom }) {
  if (selectedBottom > parentHeight) return 'down';
  if (selectedTop < 0) return 'up';
  return null;
}

// Index of the first row in the run of recently closed rows at the end of
// the list, or -1 when the list doesn't end with one
function closedRunStart(types) {
  let start = -1;
  for (let i = types.length - 1; i >= 0 && types[i] === SESSION_TYPE; i -= 1) {
    start = i;
  }
  return start;
}

// What happens to the row at `index` once its tab is closed. Without
// recently closed tabs it goes away; with them it turns into a recently
// closed row, which can move to the top of the closed rows at the bottom.
// types: the type of every row, in list order
// Returns { remove: true } or { repaint: true, moveBefore? } where
// moveBefore is the index of the row to insert it before, or null for the
// end of the list.
export function closedRowPlan(index, types, {
  showRecentlyClosed,
  alwaysShowRecentlyClosedAtTheBottom,
}) {
  if (!showRecentlyClosed) return { remove: true };
  if (!alwaysShowRecentlyClosedAtTheBottom) return { repaint: true };
  const repainted = types.map((type, i) => (i === index ? SESSION_TYPE : type));
  const start = closedRunStart(repainted);
  return { repaint: true, moveBefore: start < 0 ? null : start };
}
