## ADDED Requirements

### Requirement: Menu shows actions applicable to tab type
The context menu SHALL only display actions that are valid for the right-clicked tab's type.

#### Scenario: Regular tab (type TAB)
- **WHEN** the user right-clicks a regular tab
- **THEN** the menu shows: Switch to Tab, Close Tab, Refresh, Pin/Unpin, Mute/Unmute, Copy URL, Delete Duplicates

#### Scenario: Session tab (type SESSION)
- **WHEN** the user right-clicks a recently closed (session) tab
- **THEN** the menu shows: Restore Tab, Copy URL

#### Scenario: Other-window tab (type OTHER_WINDOW_TAB)
- **WHEN** the user right-clicks a tab from another window
- **THEN** the menu shows: Switch to Tab, Close Tab, Refresh, Pin/Unpin, Mute/Unmute, Copy URL, Delete Duplicates

#### Scenario: Bookmark (type BOOKMARK)
- **WHEN** the user right-clicks a bookmark entry
- **THEN** the menu shows: Open Bookmark, Copy URL

#### Scenario: History entry (type HISTORY)
- **WHEN** the user right-clicks a history entry
- **THEN** the menu shows: Open Page, Copy URL

### Requirement: Menu labels reflect tab state
Action labels SHALL reflect the current state of the tab so the user sees the resulting action, not the current state.

#### Scenario: Pinned tab
- **WHEN** the context menu is shown for a pinned tab
- **THEN** the pin action label reads "Unpin Tab"

#### Scenario: Unpinned tab
- **WHEN** the context menu is shown for an unpinned tab
- **THEN** the pin action label reads "Pin Tab"

#### Scenario: Muted tab
- **WHEN** the context menu is shown for a muted tab
- **THEN** the mute action label reads "Unmute Tab"

#### Scenario: Unmuted tab
- **WHEN** the context menu is shown for an unmuted tab
- **THEN** the mute action label reads "Mute Tab"

### Requirement: Menu actions execute existing action logic
Clicking a context menu item SHALL execute the same logic as the corresponding keyboard shortcut action.

#### Scenario: Close tab via context menu
- **WHEN** the user clicks "Close Tab" in the context menu
- **THEN** the tab is closed using the same logic as the TAB_DELETE keyboard action

#### Scenario: Pin tab via context menu
- **WHEN** the user clicks "Pin Tab" in the context menu
- **THEN** the tab's pin state is toggled using the same logic as the TAB_PIN keyboard action

#### Scenario: Copy URL via context menu
- **WHEN** the user clicks "Copy URL" in the context menu
- **THEN** the tab's URL is copied to clipboard using the same logic as the URL_COPY keyboard action

### Requirement: Menu items are visually distinct for destructive actions
Destructive actions (close, delete duplicates) SHALL be visually distinguished from non-destructive actions.

#### Scenario: Close tab item styling
- **WHEN** the context menu is displayed
- **THEN** the "Close Tab" and "Delete Duplicates" items are styled with a red/warning text color to indicate destructive intent
