## ADDED Requirements

### Requirement: Tab objects include group information
After tabs are queried from the browser, each tab object SHALL be enriched with group data. If a tab has a valid `groupId` (not `TAB_GROUP_ID_NONE`), the tab object SHALL include a `group` property containing the group's `id`, `title`, and `color`.

#### Scenario: Tab in a group gets enriched
- **WHEN** `browser.tabs.query()` returns a tab with `groupId: 5`
- **AND** `browser.tabGroups.query()` returns a group `{ id: 5, title: "Work", color: "blue" }`
- **THEN** the tab object includes `group: { id: 5, title: "Work", color: "blue" }`

#### Scenario: Tab not in a group
- **WHEN** `browser.tabs.query()` returns a tab with `groupId: -1` (TAB_GROUP_ID_NONE)
- **THEN** the tab object does not include a `group` property

### Requirement: Group data is fetched efficiently
The system SHALL fetch all tab groups in a single `browser.tabGroups.query()` call and join them to tabs in memory using a Map lookup. The system SHALL NOT make per-tab API calls for group data.

#### Scenario: Single API call for groups
- **WHEN** the popup queries 50 tabs across 3 groups
- **THEN** exactly one `browser.tabGroups.query()` call is made (not 50)

### Requirement: Group data is cached
Group data SHALL be cached with the same TTL as tab data. The cache SHALL be invalidated when `tabGroups.onCreated`, `tabGroups.onUpdated`, or `tabGroups.onRemoved` events fire.

#### Scenario: Cache invalidation on group update
- **WHEN** a group's title or color changes while the popup is open
- **THEN** the group cache is invalidated
- **AND** the next search/render cycle fetches fresh group data

#### Scenario: Cache hit within TTL
- **WHEN** group data was fetched less than 2 seconds ago and no invalidation event occurred
- **THEN** the cached group data is reused without an API call

### Requirement: Graceful degradation when API is unavailable
If `browser.tabGroups` is undefined, the system SHALL skip all group data fetching. Tab objects SHALL not include a `group` property. No errors SHALL be thrown or logged.

#### Scenario: Firefox < 131
- **WHEN** the extension runs on a browser where `browser.tabGroups` is undefined
- **THEN** tabs are displayed without group indicators and all group-related code paths are skipped

#### Scenario: tabGroups permission not granted
- **WHEN** the `tabGroups` permission is listed but the browser does not support it
- **THEN** the system detects the missing API at runtime and degrades gracefully

### Requirement: tabGroups permission is declared in the manifest
The extension manifest SHALL include `"tabGroups"` in the permissions array so the API is available at runtime.

#### Scenario: Manifest includes permission
- **WHEN** the extension is loaded
- **THEN** `browser.tabGroups` is accessible (on supported browsers)
