## Why

Chrome and Firefox both support tab groups — a way for users to visually organize related tabs under a named, color-coded group. TabSearch currently has no awareness of these groups, so users who rely on tab groups lose that organizational context when searching. Surfacing group membership in the search UI and enabling group-based actions would make TabSearch a more complete tab management tool.

## What Changes

- Display each tab's group membership in the popup UI via a subtle color indicator and group name label
- Fetch and cache tab group data alongside existing tab queries
- Add a keyboard-accessible action to assign/unassign tabs to groups (leveraging `tabs.group()` / `tabs.ungroup()`)
- Add the `tabGroups` permission to manifests
- Gracefully degrade on browsers/versions that don't support the `tabGroups` API (Firefox < 131, older Chrome builds)

## Capabilities

### New Capabilities
- `tab-group-display`: Visual indicators showing a tab's group membership (color dot + group title) in the popup tab list
- `tab-group-actions`: Keyboard and click actions for assigning/removing tabs from groups via `tabs.group()` / `tabs.ungroup()`
- `tab-group-data`: Fetching, caching, and normalizing tab group data from the `tabGroups` API with graceful degradation

### Modified Capabilities
_(none — no existing spec-level requirements change)_

## Impact

- **Manifest**: `tabGroups` permission added to `base.json`
- **Popup DOM** (`dom.js`): Tab row elements gain a group indicator element
- **Popup CSS** (`index.css`): New styles for group color dots and labels, designed to coexist with existing left-border type indicators
- **Search/cache** (`search.js`, `caches.js`): Tab group data fetched and joined onto tab objects
- **Browser utils** (`browser.js`): New functions wrapping `tabs.group()`, `tabs.ungroup()`, `tabGroups.query()`
- **Keyboard** (`keyboard.js`, defaults): New shortcut for group assignment action
- **Constants** (`constants.js`): Group color palette mapping (grey, blue, red, yellow, green, pink, purple, cyan, orange)
- **No new dependencies** — all functionality uses built-in WebExtension APIs
