# Changelog

## Todo

- More mouse controls for tab management
- Internationalization
  + In progress
- Move tabs
- Focus active tab in list on popup initialization
- Compact layout
- Dark theme
- Vertically centered overlay

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
