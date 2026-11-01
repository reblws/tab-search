import {
  TAB_DELETE,
  TAB_OPEN,
  TAB_NEXT,
  TAB_PREV,
  TAB_REFRESH,
  TAB_PIN,
  URL_COPY,
  DUPLICATE_TAB_DELETE,
  MUTE_TOGGLE,
} from '../keyboard/constants';
import { TAB_TYPE, OTHER_WINDOW_TAB_TYPE } from '../tabs/types';
import { findDuplicateTabs } from '../tabs/duplicates';

// Where focus goes, or what happens to which result row, for a popup
// command. The popup gathers the values; this decides; the popup applies it.
//
// view: {
//   items: [{ type, url, lastAccessed }]  one per result row, in list order
//   focused: index of the focused row, or -1 when the search input has focus
//   noResults: true when the list shows no results
// }
// Returns one of, or null for nothing:
//   { focus: <row index> } | { focus: 'search' }
//   { close: [<row index>, ...] }
//   { open | reload | pin | mute | copyUrl: <row index> }
export const SEARCH = 'search';

const isOpenTab = item => !!item
  && (item.type === TAB_TYPE || item.type === OTHER_WINDOW_TAB_TYPE);

export function planNavigation(cmd, { items, focused, noResults }) {
  const searchFocused = focused < 0;
  // With the search input focused, commands act on the first result
  const selected = searchFocused ? 0 : focused;
  if (selected >= items.length) return null;
  const last = items.length - 1;
  const ifOpenTab = plan => (isOpenTab(items[selected]) ? plan : null);
  switch (cmd) {
    case TAB_NEXT:
      if (searchFocused) return { focus: selected };
      return { focus: selected < last ? selected + 1 : SEARCH };
    case TAB_PREV:
      if (searchFocused) return { focus: last };
      return { focus: selected > 0 ? selected - 1 : SEARCH };
    case TAB_DELETE:
      return searchFocused ? null : ifOpenTab({ close: [selected] });
    case TAB_OPEN:
      return { open: selected };
    case TAB_REFRESH:
      return ifOpenTab({ reload: selected });
    case TAB_PIN:
      return ifOpenTab({ pin: selected });
    case MUTE_TOGGLE:
      return ifOpenTab({ mute: selected });
    case URL_COPY:
      return { copyUrl: selected };
    case DUPLICATE_TAB_DELETE: {
      if (noResults) return null;
      const close = findDuplicateTabs(items);
      return close.length > 0 ? { close } : null;
    }
    default:
      return null;
  }
}
