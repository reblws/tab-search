## ADDED Requirements

### Requirement: Context menu appears on tab row right-click
The system SHALL display a context menu when the user right-clicks on a tab row in the popup. The browser's native context menu SHALL be suppressed on tab rows.

#### Scenario: Right-click on a tab row
- **WHEN** the user right-clicks on a tab row element (or any child element within it)
- **THEN** a context menu is displayed near the click position, and the native browser context menu is not shown

#### Scenario: Right-click on non-tab area
- **WHEN** the user right-clicks on the search bar, settings button, or empty space
- **THEN** the native browser context menu is shown as normal (no custom menu appears)

### Requirement: Context menu positioned within popup viewport
The system SHALL position the context menu so it remains fully visible within the popup frame.

#### Scenario: Right-click near bottom of popup
- **WHEN** the user right-clicks a tab row near the bottom of the popup and there is insufficient space below for the menu
- **THEN** the menu opens upward from the click position so all items are visible

#### Scenario: Right-click near right edge of popup
- **WHEN** the user right-clicks a tab row near the right edge of the popup
- **THEN** the menu opens leftward from the click position so all items are visible

### Requirement: Context menu displays action items with shortcut hints
Each menu item SHALL display the action label and, if a keyboard shortcut is bound, the shortcut as a right-aligned hint.

#### Scenario: Action with keyboard shortcut
- **WHEN** the context menu is shown and an action has a configured keyboard shortcut
- **THEN** the menu item displays the action label on the left and the shortcut text on the right

#### Scenario: Action without keyboard shortcut
- **WHEN** the context menu is shown and an action has no configured keyboard shortcut
- **THEN** the menu item displays only the action label with no shortcut hint

### Requirement: Context menu is dismissed on standard triggers
The system SHALL close the context menu when the user interacts outside of it.

#### Scenario: Click outside menu
- **WHEN** the context menu is open and the user clicks anywhere outside the menu
- **THEN** the context menu is closed

#### Scenario: Press Escape
- **WHEN** the context menu is open and the user presses Escape
- **THEN** the context menu is closed

#### Scenario: Scroll tab list
- **WHEN** the context menu is open and the user scrolls the tab list
- **THEN** the context menu is closed

#### Scenario: Action executed
- **WHEN** the user clicks a menu item
- **THEN** the action is executed and the context menu is closed

### Requirement: Context menu has its own keyboard navigation
While the context menu is open, it SHALL capture keyboard input for its own navigation. Tab list navigation and action shortcuts SHALL be suppressed.

#### Scenario: Arrow Down moves to next item
- **WHEN** the context menu is open and the user presses Arrow Down
- **THEN** the next menu item is highlighted (skipping separators), and the tab list selection does not change

#### Scenario: Arrow Up moves to previous item
- **WHEN** the context menu is open and the user presses Arrow Up
- **THEN** the previous menu item is highlighted (skipping separators), and the tab list selection does not change

#### Scenario: Arrow Down wraps from last to first
- **WHEN** the last menu item is highlighted and the user presses Arrow Down
- **THEN** the first menu item is highlighted

#### Scenario: Arrow Up wraps from first to last
- **WHEN** the first menu item is highlighted and the user presses Arrow Up
- **THEN** the last menu item is highlighted

#### Scenario: Enter activates highlighted item
- **WHEN** a menu item is highlighted and the user presses Enter
- **THEN** the action for that item is executed and the menu is closed

#### Scenario: Tab action shortcut while menu open
- **WHEN** the context menu is open and the user presses a tab action shortcut (e.g., Ctrl+Backspace)
- **THEN** the action is not executed

#### Scenario: No item highlighted initially
- **WHEN** the context menu first opens via right-click
- **THEN** no item is highlighted until the user presses an arrow key
