## Context

TabSearch's popup UI renders a searchable list of tab rows. Users interact with tabs via click (switch to tab), Ctrl+click (close), a delete button, and keyboard shortcuts for actions like pin, mute, refresh, and copy URL. There is no right-click handling — the browser's native context menu appears.

As the extension grows more actions (bookmarking, moving tabs between windows, grouping), keyboard shortcuts alone become a poor discovery mechanism. A context menu provides a standard, scalable surface for tab actions.

The popup runs as a standard HTML page in the extension popup frame. There is no framework — DOM is built imperatively in `utils/dom.js` and events are wired in `event-callbacks.js`. Actions are executed via functions in `utils/keyboard.js` and `utils/browser.js`.

## Goals / Non-Goals

**Goals:**
- Provide a right-click context menu on tab rows that surfaces available actions
- Show keyboard shortcut hints alongside each action for discoverability
- Adapt menu items to the tab's type (tab, session, bookmark, history) and state (pinned, muted, audible)
- Reuse existing action execution logic — no new browser API calls

**Non-Goals:**
- Context menu on non-tab elements (search bar, settings button)
- Nested/hierarchical submenus
- Custom theming or color configuration for the menu (follows existing popup theme)
- Browser-native `contextMenus` API — this is a DOM-based menu within the popup, not a browser chrome context menu
- Persisting any menu-related state to Redux

## Decisions

### DOM-based menu vs browser contextMenus API

**Choice**: DOM-based menu rendered inside the popup.

The browser `contextMenus` API is designed for page context menus and background script menus, not extension popup UIs. A DOM-based approach gives full control over styling, positioning, and behavior within the popup frame. It also works identically across Firefox and Chrome.

### Single shared menu element vs per-row menus

**Choice**: Single menu element, repositioned and reconfigured on each right-click.

Creating a menu element per tab row would bloat the DOM unnecessarily. A single `<div class="context-menu">` is appended to the popup body, shown/hidden and populated dynamically based on which tab was right-clicked.

### Action availability logic

**Choice**: Determine available actions at menu-open time based on tab type and state.

Each action has a predicate (e.g., "pin" is available for TAB type only; label is "Unpin" if already pinned). This logic lives in a dedicated function that returns the menu item configuration for a given tab, keeping it testable and separate from DOM code.

### Dismissal behavior

**Choice**: Menu dismissed on click outside, Escape key, scroll, or any action execution.

This follows standard context menu UX. The popup's existing keydown handler will check for Escape when the menu is open.

## Risks / Trade-offs

- **Popup frame boundaries**: The menu must stay within the popup's viewport. If a tab row is near the bottom, the menu should open upward. → Mitigated by calculating available space and flipping direction.
- **Interaction with keyboard navigation**: When the menu is open, arrow keys and other shortcuts should not navigate tabs. → Mitigated by checking menu-open state in the existing keydown handler.
- **Accessibility**: Context menus are inherently mouse-driven. → Keyboard shortcuts remain the primary keyboard interface; the menu is additive, not a replacement.
