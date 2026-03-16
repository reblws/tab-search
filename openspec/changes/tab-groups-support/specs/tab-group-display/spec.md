## ADDED Requirements

### Requirement: Group indicator is shown on grouped tabs
The popup SHALL display a group indicator on each tab that belongs to a tab group. The indicator SHALL consist of a colored dot matching the group's color followed by the group's title text. The indicator SHALL be placed inline after the tab title, inside the `.tab-info` container.

#### Scenario: Tab belongs to a group with a title
- **WHEN** a tab has a `groupId` that resolves to a group with color "blue" and title "Work"
- **THEN** the tab row displays a small blue dot followed by the text "Work" after the tab title

#### Scenario: Tab belongs to a group without a title
- **WHEN** a tab has a `groupId` that resolves to a group with color "red" and no title (empty string)
- **THEN** the tab row displays only a colored red dot after the tab title, with no label text

#### Scenario: Tab does not belong to any group
- **WHEN** a tab has no `groupId` or its `groupId` equals `TAB_GROUP_ID_NONE`
- **THEN** no group indicator element is rendered in the tab row

### Requirement: Group indicator uses muted color palette
The group indicator dot SHALL use a muted/pastel variant of each of the 9 `tabGroups.Color` values (grey, blue, red, yellow, green, pink, purple, cyan, orange). Colors SHALL be defined as CSS custom properties using `light-dark()` to support both light and dark mode.

#### Scenario: Group colors render correctly in light mode
- **WHEN** the browser is in light mode and a tab belongs to a group with color "green"
- **THEN** the group dot displays using the light-mode muted green value

#### Scenario: Group colors render correctly in dark mode
- **WHEN** the browser is in dark mode and a tab belongs to a group with color "green"
- **THEN** the group dot displays using the dark-mode muted green value

### Requirement: Group indicator does not interfere with existing type indicators
The group indicator SHALL coexist with the existing 5px left-border source-type indicator. The left border SHALL continue to reflect the tab's source type (current window, other window, session, bookmark, history) regardless of group membership.

#### Scenario: Grouped tab from another window
- **WHEN** a tab belongs to a group AND is from another window
- **THEN** the tab row shows the other-window left border color AND the group indicator badge

### Requirement: Group indicator is visually subtle
The group indicator label text SHALL use a reduced font size and secondary text color so it does not visually compete with the tab title or URL. The dot SHALL be small (6-8px diameter).

#### Scenario: Visual hierarchy is maintained
- **WHEN** a grouped tab is displayed
- **THEN** the tab title remains the most prominent text element, followed by the URL, with the group label being the least prominent

### Requirement: Group indicator truncates gracefully
The group indicator SHALL truncate with an ellipsis if the group title is too long to fit in the available space. The tab title and URL SHALL NOT be displaced or clipped by the group indicator.

#### Scenario: Long group name
- **WHEN** a tab belongs to a group with a very long title (e.g., 50+ characters)
- **THEN** the group label truncates with ellipsis and the tab title and URL remain fully visible

### Requirement: Group indicator is accessible
The group indicator SHALL include appropriate ARIA attributes so screen readers can announce the group membership. The group color name SHALL be conveyed textually, not only through color.

#### Scenario: Screen reader announces group
- **WHEN** a screen reader user focuses a tab row that belongs to a group titled "Work" with color "blue"
- **THEN** the screen reader announces the group membership (e.g., via an aria-label or visually hidden text)
