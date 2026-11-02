// Where to put the fallback window: centered on the window it was opened
// from, a third of the way down, and never larger than that window.
export const WINDOW_SIZE = { width: 600, height: 560 };

// win: { left, top, width, height } (any may be missing)
export function centeredBounds(win, size = WINDOW_SIZE) {
  const parent = win || {};
  const width = Math.min(size.width, parent.width || size.width);
  const height = Math.min(size.height, parent.height || size.height);
  const bounds = { width, height };
  if ([parent.left, parent.top, parent.width, parent.height].every(Number.isFinite)) {
    bounds.left = Math.round(parent.left + (parent.width - width) / 2);
    bounds.top = Math.round(parent.top + Math.max(0, (parent.height - height) / 3));
  }
  return bounds;
}
