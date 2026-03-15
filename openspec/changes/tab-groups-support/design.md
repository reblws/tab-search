## Context

TabSearch displays tabs from the browser in a searchable popup list. Each tab row shows a favicon, title, URL, and a colored left border indicating the tab's source type (current window, other window, recently closed, bookmark, history). The extension uses vanilla DOM manipulation (no framework), Redux for state, and supports both Firefox and Chrome via WebExtension APIs.

Both browsers now support the `tabGroups` API (Chrome 89+, Firefox 131+), which lets users organize tabs into named, color-coded groups. TabSearch currently has no awareness of these groups.

### Current tab row layout
```
┌─────────────────────────────────────────────────┐
│ ▌ [favicon]  Tab Title                      [×] │
│ ▌            https://example.com                │
└─────────────────────────────────────────────────┘
 ↑ 5px left border = source type color
```

## Goals / Non-Goals

**Goals:**
- Show tab group membership visually without cluttering the existing UI
- Let users assign/unassign tabs to groups via keyboard or click
- Gracefully degrade when the `tabGroups` API is unavailable
- Keep the feature lightweight — no new dependencies, minimal state additions

**Non-Goals:**
- Creating/deleting tab groups from within TabSearch (users do this in the browser)
- Renaming or recoloring groups from within TabSearch
- Sorting or filtering by group (possible future enhancement)
- Showing collapsed group state or group headers as separators

## Decisions

### 1. Group indicator placement: inline badge after the title

**Decision:** Add a small colored dot + group name label inline after the tab title, inside `.tab-info`.

**Alternatives considered:**
- *Replace the left border color:* Conflicts with the existing source-type indicator system which users have learned and can customize.
- *Second left border or right border:* Visually heavy; hard to distinguish two adjacent colored borders.
- *Background tint on the entire row:* Clashes with the hover/selected background color and the dark mode theme.

**Rationale:** An inline badge is unobtrusive, doesn't conflict with the existing left-border type indicator, and naturally truncates/hides when space is tight. The group color dot provides scannable visual grouping while the label gives context.

```
┌─────────────────────────────────────────────────┐
│ ▌ [favicon]  Tab Title  ● Work                  │
│ ▌            https://example.com                │
└─────────────────────────────────────────────────┘
                          ↑ group dot + label
```

### 2. Group color mapping: use muted/pastel variants of the API colors

**Decision:** Map the 9 `tabGroups.Color` values (grey, blue, red, yellow, green, pink, purple, cyan, orange) to muted CSS color values that work in both light and dark mode. Use `light-dark()` like the existing Acorn design tokens.

**Rationale:** The raw group colors (especially yellow, green, cyan) are too saturated to use directly as text or background colors in the popup without creating visual noise. Muted variants maintain the color identity while fitting the existing design language.

### 3. Data fetching: enrich tabs with group info at query time

**Decision:** After `browser.tabs.query()` returns, call `browser.tabGroups.query()` to get all groups in relevant windows, then join `tab.groupId` → `group` onto each tab object. Cache group data with the same TTL as tabs.

**Alternatives considered:**
- *Fetch groups on demand per tab:* N+1 queries, slow for many tabs.
- *Store groups in Redux:* Unnecessary persistence — group data is transient and changes frequently.

**Rationale:** A single `tabGroups.query()` call returns all groups. Joining in-memory is fast and keeps the existing data flow (query → annotate → search → render) intact.

### 4. Group assignment UX: context action via keyboard shortcut

**Decision:** Add a keyboard shortcut (default: `g`) that, when pressed on a focused tab, opens the browser's native tab group picker or cycles through groups. The action will use `browser.tabs.group()` to assign and `browser.tabs.ungroup()` to remove.

**Alternatives considered:**
- *Custom group picker dropdown inside the popup:* Significant UI complexity; requires maintaining a list of groups, styling a dropdown, and keyboard navigation within it.
- *Right-click context menu:* WebExtension popups don't support custom context menus easily.

**Rationale:** Since the browser already has UI for creating/naming groups, TabSearch should focus on quick assignment. A keyboard shortcut keeps the keyboard-first philosophy. If no groups exist, the action creates a new group containing the selected tab (browser default behavior of `tabs.group()`).

### 5. API availability: runtime feature detection

**Decision:** Check for `browser.tabGroups` at startup. If unavailable, skip all group-related code paths. No group indicator is rendered, no shortcut is registered.

**Rationale:** The `tabGroups` API isn't available on Firefox < 131 or older Chrome. Feature detection is simpler than version sniffing and handles edge cases (e.g., disabled flags).

## Risks / Trade-offs

- **[Risk] Group data stale after popup opens** → Group membership can change while the popup is open. Mitigation: invalidate group cache on `tabGroups.onUpdated` / `onCreated` / `onRemoved` events, same pattern as existing tab cache invalidation.
- **[Risk] Performance with many groups** → `tabGroups.query()` is cheap (single call, small payload). The join is O(tabs × 1 lookup) with a Map. No concern at realistic tab counts.
- **[Risk] Color contrast in dark mode** → The 9 group colors need accessible contrast in both themes. Mitigation: define explicit `light-dark()` pairs for each color, tested against both backgrounds.
- **[Trade-off] No custom group management UI** → Users must use the browser's built-in group UI to create/rename/recolor groups. This keeps TabSearch simple but limits power-user workflows. Can be revisited based on feedback.
- **[Trade-off] Keyboard shortcut collision** → The default `g` shortcut may conflict with users' custom bindings. Mitigation: it's configurable via the existing keyboard settings system.
