## Why

Tab actions (close, pin, mute, refresh, copy URL, etc.) are currently only accessible via keyboard shortcuts. As we add more actions, memorizing shortcuts becomes impractical for users. A right-click context menu on tab rows provides a discoverable, familiar interaction pattern that scales to many actions without cluttering the UI.

## What Changes

- Add a context menu that appears on right-click of a tab row in the popup
- Menu surfaces all available tab actions (close, pin/unpin, mute/unmute, refresh, copy URL, duplicate delete) with their keyboard shortcut hints
- Menu items adapt to tab state (e.g., shows "Unpin" for pinned tabs, "Unmute" for muted tabs)
- Menu items adapt to tab type (e.g., session tabs can't be pinned or muted)
- Suppress the browser's native context menu on tab rows

## Capabilities

### New Capabilities
- `context-menu-ui`: Rendering the context menu element, positioning it relative to the clicked tab row, and dismissing it
- `context-menu-actions`: Determining which actions are available for a given tab type/state and executing them from the menu

### Modified Capabilities

_None_

## Impact

- **Popup page**: New DOM elements for the menu, new event listeners for right-click/dismiss
- **Event callbacks**: Right-click handler on tab rows, click handlers on menu items
- **CSS**: Styling for the context menu overlay and items
- **Keyboard actions**: Reuse existing action functions from `utils/keyboard.js` — no changes needed to the actions themselves
