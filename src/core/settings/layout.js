// Settings page layout arithmetic

// The menu section to highlight: the last visible one whose top has
// scrolled past the line, or the last visible one at the bottom of the page.
// sections: [{ top, hidden }] in page order, with null for a missing one
export function activeSection(sections, { line, atBottom }) {
  return sections.reduce((active, section, i) => {
    if (!section || section.hidden) return active;
    return atBottom || section.top <= line ? i : active;
  }, 0);
}

// The scrollLeft that brings [start, end] into a sideways scrolling menu,
// or null when it's already in view
export function revealScrollLeft({ start, end }, { scrollLeft, clientWidth }) {
  if (start < scrollLeft) return start;
  if (end > scrollLeft + clientWidth) return end - clientWidth;
  return null;
}

// How much to shrink a popup preview of `width` to fit `room`, and the
// label under it
export function previewFit({ room, width, popupWidth = width }) {
  const scale = room > 0 && width > 0 ? Math.min(1, room / width) : 1;
  const label = scale < 1
    ? `${popupWidth} px wide, shown at ${Math.floor(scale * 100)}%`
    : `${popupWidth} px wide`;
  return { scale, label };
}
