// The radio group that stands for the two most-recently-used settings
export const MRU_SORT = 'mruSort';
export const MRU_NEVER = 'never';
export const MRU_POPUP = 'popup';
export const MRU_ALWAYS = 'always';
export const MRU_POPUP_KEY = 'shouldSortByMostRecentlyUsedOnPopup';
export const MRU_ALL_KEY = 'shouldSortByMostRecentlyUsedAll';

// The two most-recently-used booleans are one three-way choice on the page.
// The popup sorts by MRU before typing when only the first is on, and always
// when both are.
export function mruChoice({ [MRU_POPUP_KEY]: onPopup, [MRU_ALL_KEY]: all }) {
  if (onPopup && all) return MRU_ALWAYS;
  if (onPopup) return MRU_POPUP;
  return MRU_NEVER;
}

export function mruSettings(choice) {
  return {
    [MRU_POPUP_KEY]: choice !== MRU_NEVER,
    [MRU_ALL_KEY]: choice === MRU_ALWAYS,
  };
}
