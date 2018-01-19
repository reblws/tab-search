// Actions
export const TAB_DELETE = 'TAB_DELETE';
export const TAB_OPEN = 'TAB_OPEN';
export const TAB_NEXT = 'TAB_NEXT';
export const TAB_PREV = 'TAB_PREV';
export const TAB_MOVE = 'TAB_MOVE';
export const TAB_REFRESH = 'TAB_REFRESH';
export const TAB_PIN = 'TAB_PIN';
export const URL_COPY = 'URL_COPY';
export const TAB_BOOKMARK = 'TAB_BOOKMARK';
export const DUPLICATE_TAB_DELETE = 'DUPLICATE_TAB_DELETE';
export const MUTE_TOGGLE = 'MUTE_TOGGLE';

// Modifier constants
export const CONTROL = 'Control';
export const CTRL = 'Ctrl';
export const ALT = 'Alt';
export const SHIFT = 'Shift';
export const META = 'Meta';

// Error messages
export const ERROR_MSG_NOT_VALID_SINGLE_KEY = 'Not a valid single key.';
export const ERROR_MSG_NOT_VALID_FINAL_COMBO_KEY = 'Not a valid final key for combination shortcut.';
export const ERROR_MSG_FINAL_KEY_IS_MODIFIER = 'Final key is a modifier!';

// Shortcut hints
export const HINT_MSG_SHOULD_USE_MODIFIERS =
  'Try adding a modifier key (Ctrl/Cmd, Alt, Shift) to your shortcut combination.';
export const HINT_MSG_SINGLE_KEYS =
  "Letters and numbers [A-Za-z0-9] aren't allowed on their own as a shortcut.";
export const HINT_MSG_TRY_PUNCTUATION =
  'Punctuation keys [- = [ ] \\ ; \' , . /] tend to work well as shortcuts';
export const HINT_MSG_NEED_FINAL_KEY = 'Finish your shortcut by pressing a non-modifier (NOT Ctrl/Cmd, Alt, or Shift) key.';
