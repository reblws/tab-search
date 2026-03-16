## 1. Context Menu DOM and Styling

- [ ] 1.1 Add context menu HTML structure to `src/static/popup/index.html` (a hidden `<div class="context-menu">` container)
- [ ] 1.2 Add context menu CSS to `src/static/popup/index.css` (positioning, appearance, item hover states, shortcut hints, destructive action styling, dark mode support)

## 2. Action Configuration

- [ ] 2.1 Create a context menu module (`src/core/pages/popup/context-menu.js`) with a function that returns the list of available actions for a given tab, including label, action ID, destructive flag, and keyboard shortcut text — adapting to tab type and state

## 3. Menu Rendering and Positioning

- [ ] 3.1 Implement menu rendering: populate the context menu element with items based on the action configuration for the right-clicked tab
- [ ] 3.2 Implement menu positioning: place the menu near the click coordinates, flipping up/left when near popup edges to stay within the viewport

## 4. Event Handling

- [ ] 4.1 Add `contextmenu` event listener on the tab list to open the menu on right-click, suppressing the native context menu for tab rows only
- [ ] 4.2 Add dismiss handlers: click outside, Escape key, scroll on tab list
- [ ] 4.3 Add click handler on menu items to execute the corresponding action and close the menu
- [ ] 4.4 Guard the existing keydown handler in `event-callbacks.js` to suppress tab navigation and action shortcuts while the context menu is open

## 5. Integration and Testing

- [ ] 5.1 Wire up context menu initialization in popup `index.js` / `side-effects.js`
- [ ] 5.2 Manually verify: right-click shows menu with correct actions for each tab type, state-dependent labels are correct, shortcut hints display, menu dismisses properly, keyboard nav is blocked while open, positioning flips near edges
