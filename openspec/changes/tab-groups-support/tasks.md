## 1. Manifest & Permission

- [x] 1.1 Add `"tabGroups"` to the permissions array in `src/manifest/base.json`

## 2. Group Data Layer

- [x] 2.1 Add a `tabGroupsSupported()` feature-detection utility that returns `true` if `browser.tabGroups` exists (in `src/core/pages/popup/utils/browser.js`)
- [x] 2.2 Add a `queryTabGroups()` function that calls `browser.tabGroups.query({})` and returns a Map of `groupId → { id, title, color }` (in `browser.js`)
- [x] 2.3 Add group cache in `src/core/pages/popup/caches.js` with the same 2-second TTL pattern as tabs, plus invalidation listeners for `tabGroups.onCreated`, `tabGroups.onUpdated`, `tabGroups.onRemoved`
- [x] 2.4 Enrich tab objects with a `group` property after `queryTabs()` by joining against the group Map — skip enrichment if API unavailable (in `search.js` or `browser.js`)

## 3. Group Display

- [x] 3.1 Define CSS custom properties for the 9 group colors using `light-dark()` values in `src/static/popup/index.css`
- [x] 3.2 Add `.tab-group-badge` styles (dedicated third line below URL: colored dot + label, muted font size, ellipsis overflow, max-width) in `index.css`
- [x] 3.3 Update `createTabObject()` in `dom.js` to render a group indicator element as a new line (dot + title label) below the URL inside `.tab-info` when `tab.group` is present
- [x] 3.4 Add `aria-label` or visually hidden text to the group indicator for screen reader accessibility
- [x] 3.5 Pass `tab.group` data through `tabToTag()` → `createTabObject()` (update destructuring and option forwarding)

## 4. Group Actions

- [x] 4.1 Add a `TAB_GROUP_TOGGLE` keyboard command to `src/core/keyboard/defaults.js` with default key `g`
- [x] 4.2 Add `groupTab(tabId, groupId)` and `ungroupTab(tabId)` wrapper functions in `browser.js` using `browser.tabs.group()` / `browser.tabs.ungroup()`
- [x] 4.3 Handle `TAB_GROUP_TOGGLE` in `navigateResults()` (`keyboard.js`): if tab is grouped → ungroup; if ungrouped → assign to most recent group or create new group
- [x] 4.4 After group/ungroup action, invalidate group cache and re-render the affected tab row's group indicator without closing the popup

## 5. Cache Invalidation & Events

- [x] 5.1 Register `tabGroups.onCreated`, `tabGroups.onUpdated`, `tabGroups.onRemoved` listeners in `side-effects.js` to invalidate the group cache (guard with feature detection)
- [x] 5.2 Verify that existing tab cache invalidation (`tabs.onUpdated`) still fires when a tab's `groupId` changes, and add handling if needed

## 6. Settings Integration

- [x] 6.1 Add the `TAB_GROUP_TOGGLE` shortcut to the keyboard settings UI in the settings page so users can rebind it
- [x] 6.2 Conditionally hide the group shortcut setting when `tabGroupsSupported()` returns false

## 7. Testing & Validation

- [ ] 7.1 Manually test group indicator rendering with multiple groups, colors, and empty titles in Chrome
- [ ] 7.2 Manually test group indicator rendering in Firefox (131+) and verify graceful degradation on Firefox < 131
- [ ] 7.3 Test keyboard shortcut: group → ungroup → group cycle
- [ ] 7.4 Test that dark mode colors have adequate contrast for all 9 group colors
- [x] 7.5 Run `npm run build:firefox` and `npm run build:chrome` to verify no lint or build errors
