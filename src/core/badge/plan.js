// What the tab count badge needs when the settings change or the background
// starts. state: { general: { showTabCountBadgeText }, color: { popupBadgeColor } }

const isOn = state => !!state.general.showTabCountBadgeText;
const badgeColor = state => state.color.popupBadgeColor;
// The browser's own badge color stands in for the default one
const customColor = (state, defaultColor) =>
  (badgeColor(state) !== defaultColor ? badgeColor(state) : null);

// counting: 'start', 'stop' or null; color: the badge color to set, or null
export function badgeChanges(prev, next, defaultColor) {
  if (isOn(next) !== isOn(prev)) {
    return isOn(next)
      ? { counting: 'start', color: customColor(next, defaultColor) }
      : { counting: 'stop', color: null };
  }
  if (isOn(next) && badgeColor(next) !== badgeColor(prev)) {
    return { counting: null, color: badgeColor(next) };
  }
  return { counting: null, color: null };
}

// null when the badge is off; otherwise the color to set (or null), and the
// tabs get counted unless they already were this browser session
export function badgeOnStartup(state, defaultColor) {
  return isOn(state) ? { color: customColor(state, defaultColor) } : null;
}

// The badge text for every tab of a window: its tab count
export function windowBadgeTexts(tabs) {
  const text = String(tabs.length);
  return tabs.map(({ id: tabId }) => ({ text, tabId }));
}
