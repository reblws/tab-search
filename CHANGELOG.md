# Changelog

## Unreleased

- Added Chrome support: the Chrome build now uses Manifest V3 with a service worker background
  + Listed on Chrome as "TabSearch: Fuzzy Tab Switcher", because other Chrome Web Store listings already use the TabSearch name
  + Added a 128px icon, which the Chrome Web Store requires
  + Settings, open settings pages, the last query and the tab count badge stay correct after Chrome stops the idle service worker
  + The tab count badge is counted once per browser session instead of every time the service worker wakes up
  + Added `pnpm zip:chrome` to build a Chrome Web Store zip
  + The Chrome build doesn't request the unused `activeTab` permission
- Changed the Chrome popup shortcut on Mac to <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd>: Chrome left <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd> unassigned because it conflicts with a browser shortcut
  + In Chrome, the settings page's popup shortcut field now opens Chrome's Keyboard shortcuts page, the only place it can be changed, and explains when no shortcut is assigned
- Right-clicking a tab result in Firefox now opens the tab's context menu, with the tab items of other add-ons, plus Reload, Pin, Mute and Close (#102)
  + Right-clicking a bookmark result opens the bookmark context menu of other add-ons
  + Firefox 64 is now the minimum version
- Redesigned the settings page
  + The section menu and "Find a setting" stay pinned to the top of the window. The version and the bug, changelog and source links are in the header
  + A live preview: the real popup, with your tabs, reloaded as you change settings
  + The header shows the TabSearch logo
  + Switches, segmented controls and − / + steppers replace the checkboxes, the popup size dropdown and the number boxes
  + The two "sort by most recently used" checkboxes are one choice: Never, Before typing or Always
  + Settings that depend on another one are indented and greyed out while it's off, and keep their values. Turning off fuzzy search used to also turn off sorting by closeness, and turning off recently closed tabs turned off keeping them at the bottom
  + A section's Reset button no longer reloads the page, and open settings pages follow changes made in other windows
  + Shortcuts show as keycaps. A taken or invalid combination is explained beside the shortcut instead of in a toast, and each changed shortcut can be reset on its own
  + The secondary shortcut's remove button is an accessible ghost button beside it
  + Follows the system's dark mode
- Fixed pressing a shortcut's own keys again in settings saying it's already used
- Fixed the mute shortcut not unmuting a muted tab that is playing sound
- Fixed two clear buttons showing in the Chrome search box
- Fixed overlay scrollbars covering the popup's close button, e.g. on macOS
- Fixed Copy Tab URL (<kbd>Ctrl</kbd>+<kbd>C</kbd>) copying nothing in Chrome
- Fixed an empty "()" shortcut hint in the search box when no popup shortcut is set
- Fixed new tab pages and private tabs showing up in recently closed tabs
- Fixed every tab's badge being recounted on each keystroke in the popup when "Show last query on popup" is on
- Fixed a tab count badge reappearing right after turning the badge off
- Fixed the settings page's Changelog link pointing at an outdated branch
- Added a Chrome E2E test suite on Chrome for Testing, also run in CI
- Fixed the Firefox E2E suite on Firefox 158+

## 0.7.0 (2026-10-19)

- Added a configurable search debounce delay setting
- Improved search performance
- Redesigned the close-tab button as an accessible ghost button that spans the full row height
- Fixed dark mode icons not following the theme color
- Fixed unloaded tabs or stalled session requests leaving the popup blank (Thanks @googya !)
- Fixed macOS shortcut setting treating <kbd>Ctrl</kbd> and <kbd>Cmd</kbd> as the same key (Thanks @wilmtang !)

## 0.6.2 (2026-02-07)

- Fixed fuzzy settings not updating

## 0.6.1 (2026-02-02)

- Tentative fix for settings not persisting for certain users (Thanks @54ac !)

## 0.6.0 (2026-01-29)

- Migrated from Photon to Acorn Design System
  + Use `light-dark()` CSS function for automatic theme switching
  + Remove ~300 lines of dark mode media queries
  + Switch to system fonts (321KB savings from removing Inter UI)
  + Add semantic color tokens for better maintainability
- Redesigned top bar with Acorn components
  + Replace three-dot menu icon with hamburger menu button
  + Update search bar layout with balanced spacing
  + Add clear button inside search input
- Added popup shortcut customization in settings
  + Firefox users can edit directly in settings
  + Chrome users are linked to the browser's native shortcut settings
- Fixed search failing on keywords late in long tab titles
- Added E2E tests with WebdriverIO for real browser testing
- Added GitHub Actions CI pipeline
- Added comprehensive unit test coverage

## 0.5.0 (2026-01-25)

- Added dark mode support for popup and settings page
- Added popup scaling options
- Modernized settings page with card-based design and keycap-style shortcuts
- Modernized dependencies and fixed security vulnerabilities

## 0.4.8 (2018-04-04)

- Changed <kbd>Home</kbd>/<kbd>End</kbd> to only scroll to end if input isn't selected

## 0.4.7 (2018-03-30)

- Changed previous tab command behavior: When the search input is active, going to the previous tab selects the last tab instead
- Improved key-handling for common system shortcuts:
  + <kbd>Shift</kbd>-<kbd>Tab</kbd> now goes to the previous item in the tab list
  + <kbd>Home</kbd> and <kbd>End</kbd> jump to the beginning or the ending of the tab list
  + <kbd>PgUp</kbd> and <kbd>PgDown</kbd> go to the previous or next tab in the tab list

## 0.4.6 (2018-02-27)

- Added ability to bind a second shortcut
- Added setting to ignore pinned tabs in search results
- Fixed shortcut-handling so <kbd>Meta</kbd> (i.e. <kbd>Cmd</kbd>) is treated as a separate modifier from <kbd>Ctrl</kbd>
  + If a shortcut is bound with <kbd>Ctrl</kbd>, an alternate <kbd>Cmd</kbd>-only version of the shortcut will be set as the secondary shortcut to respect old settings & behavior
- Fixed tabs closed in the tab-list not behaving like Recently Closed Tabs if "Show Recently Closed Tabs" is enabled
  + You can now click a closed-tab to re-open its session
  + If "Always Show Recently Closed Tab At Bottom" (default) is enabled, the closed tab now moves to the bottom of the tab list with all the other session tabs
  + Closed-tab color now respects user-settings for Recently Closed Tabs (it previously was stayed the default red)
- Changed shortcut-handling in settings so <Escape> cancels the prompt and reverts back to the previous setting
- Changed shortcut table to display Unicode arrows instead of "ArrowDown/Right/Up/Left"


## 0.4.5 (2018-02-11)

- Added graphical indicator for audible tabs
- Fixed reload graphic not loading when reloading a tab
- Changed <Tab> behavior to no longer focus the entire popup window after the last tab in entry
- Use Photon icon for muted tabs
- Improved error handling, if an error occurs during tab list generation, it logs the error to the console

## 0.4.4 (2018-01-21)

- Add option for changing popup badge color
- Slight visual tweaks to settings page
- Fix recently closed tabs issue where closing a window caused the initial popup to no display

## 0.4.3 (2018-01-20)

- (Potentially) Fix recently closed tabs setting causing popup to crash
- Improve error logging

## 0.4.2 (2018-01-20)

- Added customizable colors for each tab type:
  - Can change the border colors for:
    - Regular Tabs
    - Other Window Tabs
    - Bookmarks
    - History
    - Recently Closed Tabs
- Added a visual delete button for closing tabs with only the mouse
  - Also has an option to disable this
- Added an option for one line tab titles, in case you frequently run into humongous tab titles

## 0.4.1a (2018-01-19)

- Fixed production build mangling vital property names, which caused the tab popup to be empty (Thanks Michael for the quick email)

## 0.4.1 (2018-01-19)

- Fixed new settings being undefined after an update

## 0.4.0 (2018-01-18)

- Added new tab management commands:
  - Refresh Tab
  - Pin Tab
  - Copy URL
  - Delete All Duplicate Tabs
  - Toggle Mute
- Added custom shortcuts and tab management. (This does not include the popup shortcut) Can now change the following shortcuts:
  - Open Tab
  - Next Tab
  - Previous Tab
  - Delete Tab
  - Refresh Tab
  - Pin Tab
  - Copy URL
  - Delete All Duplicate Tabs
  - Toggle Mute
- Removed LeftArrow and RightArrow as keys for going to the previous or next tabs, so each command has exactly one shortcut
- Added the following visual indicators for each tab:
  - Mute tab
  - Pinned tab
  - Reloading tab
- Redesigned settings page with responsive layout
- Added options for showing results from History and Bookmarks
- Added options for changing typography, can change font sizes or set the font to the default browser sans-serif
- Changed color scheme to [Photon Design System colors](https://design.firefox.com/photon/visuals/color.html)
- Added button in popup for entering settings page
  - This might change
- Numerous visual tweaks to the popup layout
- Fixed bug where tabs from other windows were ordered first on initial popup

## 0.3.10 (2017-12-02)

- Added most recently used tab-sorting as a setting (thanks sinewave)
- Settings css packaged locally in extension

## 0.3.8 (2017-11-25)

- Changed tab-list to highlight the first tab when making a search query (suggests the idea you can press "Enter" from the input and activate the highlighted tab)
- Changed tab-list to scroll to the very top when updating the search query
- Smoothed scrolling when pressing "ArrowUp" or "ArrowDown"
- Changed word-break rules for tab titles: words shouldn't break and enter a newline unless a single word is too long

## 0.3.7 (2017-11-20)

- Added option to prefill search bar with the last query on popup
- Fixed bug where extra "right" or "down" keystroke was needed to select tab list after filling search input with text
- Input focus workaround (not guaranteed to work for most people)

## 0.3.6 (2017-11-16)

- Fixed text overflow issue (thanks blakebutcher)
- Fixed badge text setting not being disabled properly (on startup and mid browser-session)

## 0.3.5 (2017-11-14)

- Fixed badge text not updating when switching URL in Firefox 58
- Changed tab switching so that focusing on a tab from another window focuses that window as well
- Changed options to search all windows by default

## 0.3.4 (2017-11-06)

- Changed the macOS shortcut back to Cmd+Shift+L due to conflicting OS shortcut (thanks hiasl360)
- Added platform specific shortcut hint

## 0.3.3 (2017-11-06)

- Changed the extension's shortcut to Ctrl+Shift+F
  + Note: Custom shortcuts aren't possible in Firefox yet, need to wait for Firefox devs to implement custom shortcuts for browser extensions.
- Fixed issue where non-fuzzy search was case-sensitive
- Fixed input not focusing when using extension shortcut for certain users
- Update Inter UI font version to 2.2
- Added option to use the browser's default sans-serif font

## 0.3.2 (2017-10-26)

- Fixed issue where popup badge was showing badge text on browser-startup even when the setting was disabled

## 0.3.1 (2017-10-26)

- Fixed settings not saving locally
- Remove incognito closed tabs from popup result
- Fixed Ctrl+Backspace not deleting tabs
- Fixed settings page not disabling inputs properly when filling initial values
- Minor text tweaks to the settings page

## 0.3.0 (2017-10-25)

- Added settings page! From the Addons-Manager (about:addons), you can now customize the following options:
  + Display the total number of tabs in a badge above the popup icon
  + Show recently closed tabs
    - Choose the limit (up to 25) of recently closed tabs
    - Choose whether to show these results at the bottom of the results list
    - (Currently these display recently closed tabs from all windows)
  + Show tabs from all windows in the results list
  + Disable querying for tabs by url
  + Enable fuzzy search
  + Sort results by how close they match the search query
  + Fuzzy search similarity threshold
- Add ability to delete tabs with CTRL+Click or CTRL+Backspace
- Add visual indicator distinguishing the types of different tabs:
  + Blue: Tab from current window
  + Yellow: Tab from another window
  + Red: Recently closed tab

## 0.2.3 (2017-10-04)

- No `unsafe-eval` in content security policy

## 0.2.2 (2017-10-03)

- Fixed issue where two enter-key presses were required to navigate to the first search result
- Changed main font to Inter UI
- Numerous tweaks to typesetting
- Vertically centered no-result message

## 0.2.1 (2017-09-20)

- New icon! Now visible in dark browser themes.
- Fixed wrong title for extension when hovering over the icon
- Fixed issue where tab-titles with urls and spaces caused the tabs to not load

## 0.2.0 (2017-08-22)

- Initial public release
