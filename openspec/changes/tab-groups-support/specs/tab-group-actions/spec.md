## ADDED Requirements

### Requirement: User can assign a tab to a group via keyboard
The popup SHALL provide a configurable keyboard shortcut (default: `g`) that assigns the currently focused tab to a tab group. The shortcut SHALL be registered in the existing keyboard settings system.

#### Scenario: Assign ungrouped tab to a new group
- **WHEN** the user presses the group shortcut on a focused tab that is not in any group AND no groups exist in the window
- **THEN** the system calls `browser.tabs.group()` to create a new group containing that tab

#### Scenario: Assign ungrouped tab to an existing group
- **WHEN** the user presses the group shortcut on a focused tab that is not in any group AND groups exist in the window
- **THEN** the system assigns the tab to the most recently active group in the same window via `browser.tabs.group({ tabIds, groupId })`

### Requirement: User can ungroup a tab via keyboard
The popup SHALL allow the user to remove a tab from its group using the same keyboard shortcut when the tab is already grouped.

#### Scenario: Remove tab from its group
- **WHEN** the user presses the group shortcut on a focused tab that is already in a group
- **THEN** the system calls `browser.tabs.ungroup()` to remove the tab from its group
- **AND** the group indicator is removed from the tab row

### Requirement: Group actions update the UI immediately
After a group assign or ungroup action, the tab row's group indicator SHALL update without requiring the user to close and reopen the popup.

#### Scenario: Indicator appears after grouping
- **WHEN** the user assigns a tab to a group
- **THEN** the group indicator (dot + label) appears on the tab row immediately

#### Scenario: Indicator disappears after ungrouping
- **WHEN** the user removes a tab from a group
- **THEN** the group indicator is removed from the tab row immediately

### Requirement: Group actions only apply to real tabs
Group assignment SHALL only be available for tabs of type `TAB_TYPE` or `OTHER_WINDOW_TAB_TYPE`. The shortcut SHALL have no effect on session, bookmark, or history items.

#### Scenario: Shortcut pressed on a bookmark
- **WHEN** the user presses the group shortcut on a focused bookmark item
- **THEN** nothing happens — no API call is made

### Requirement: Group actions degrade gracefully
If the `tabGroups` API is unavailable, the group keyboard shortcut SHALL not be registered and SHALL have no effect.

#### Scenario: API unavailable
- **WHEN** the browser does not support `browser.tabGroups`
- **THEN** the group shortcut is not listed in keyboard settings and pressing it has no effect
