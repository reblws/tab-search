import {
  TAB_TYPE,
  OTHER_WINDOW_TAB_TYPE,
  SESSION_TYPE,
  BOOKMARK_TYPE,
  HISTORY_TYPE,
} from '../tabs/types';

const OPEN_BY_TYPE = {
  [TAB_TYPE]: 'switch',
  [OTHER_WINDOW_TAB_TYPE]: 'switch',
  [SESSION_TYPE]: 'restore',
  [BOOKMARK_TYPE]: 'openBookmark',
  [HISTORY_TYPE]: 'openHistory',
};

// What a click on a result row does: 'close', 'switch', 'restore',
// 'openBookmark', 'openHistory', or null for nothing. The delete button and
// Ctrl+click close open tabs; Ctrl+click does nothing on other rows.
// click: { type, ctrlKey, onDeleteButton }
export function clickIntent({ type, ctrlKey, onDeleteButton }) {
  const isOpenTab = type === TAB_TYPE || type === OTHER_WINDOW_TAB_TYPE;
  if (onDeleteButton || (ctrlKey && isOpenTab)) return 'close';
  if (ctrlKey) return null;
  return OPEN_BY_TYPE[type] || null;
}
