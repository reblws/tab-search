![logo-96](https://user-images.githubusercontent.com/9971847/31857881-e872b1e2-b6b6-11e7-9886-494e8a338a25.png)

# tab-search

Easy tab search & switching. This WebExtension provides a keyboard-accessible search interface for managing your open tabs.

[Get it from Mozilla Addons!](https://addons.mozilla.org/en-US/firefox/addon/tab_search/)

![screenshot](https://user-images.githubusercontent.com/9971847/29625159-f34baa02-87f8-11e7-965d-a76d8262c643.png)

## Shortcuts

| Shortcut | Description |
| --- | --- |
| <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd> | Toggle extension |
| <kbd>Ctrl/Cmd</kbd> + <kbd>Backspace</kbd> | Delete a tab |
| <kbd>Ctrl/Cmd</kbd> + Click |
| <kbd>Enter</kbd> | Open selected tab or first in list if not selected |
| <kbd>Up</kbd> / <kbd>Left</kbd> | Select next tab |
| <kbd>Down</kbd> / <kbd>Right</kbd> | Select previous tab |

<kbd>Ctrl/Cmd</kbd> + Click deletes a tab as well.

## Usage

TabSearch requires [node.js](https://nodejs.org/). Note that the `dist/` folder only contains static assets. To get the javascript and manifest.json in there compile the source first.

Step 0: If you plan on sending pull-request, you should fork the repository.

Step 1: Clone the [TabSearch](https://github.com/reblws/tab-search) repository.
```
git clone https://github.com/reblws/tab-search.git
```
If you forked the repo, just replace the clone url with your own.

Step 2: Navigate to the root of the directory you cloned and install the required dependencies.

```
npm install
```

Step 3: You'll need to compile the changes from `src/` into the `dist/` folder. The following scripts are available to help with this

```
# Starts a live server watching for changes in `src/` and outputs them to `dist/`
# NOTE: Need to restart this command if changing one of the manifest files
npm start

# Opens Firefox with add-on installed from the files in `dist/`, automatically reloads the extension on each change found in `dist/`
npm run watch:firefox
```

Step 4: Build for production
```
npm run build:firefox
```

If you want to build or watch for Chrome just use `start:chrome` or `build:chrome` instead. This just changes the manifest.json file so it doesn't raise any errors. There's no `watch` command  for Chrome yet.


## Changelog

### 0.3.3
- New shortcut! Ctrl+Shift+F now opens the popup window.
  + Note: Custom shortcuts aren't possible in Firefox yet, need to wait for Firefox devs to implement custom shortcuts for browser extensions.
- Fixed issue where non-fuzzy search was case-sensitive
- Fixed input not focusing when using extension shortcut for certain users
- Update Inter UI font version to 2.2
- Added option to use the browser's default sans-serif font

### 0.3.2
- Fixed issue where popup badge was showing badge text on browser-startup even when the setting was disabled

### 0.3.1
- Fixed settings not saving locally
- Remove incognito closed tabs from popup result
- Fixed Ctrl+Backspace not deleting tabs
- Fixed settings page not disabling inputs properly when filling initial values
- Minor text tweaks to the settings page

### 0.3.0
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

### 0.2.3
- No `unsafe-eval` in content security policy

### 0.2.2
- Fixed issue where two enter-key presses were required to navigate to the first search result
- Changed main font to Inter UI
- Numerous tweaks to typesetting
- Vertically centered no-result message

### 0.2.1

- New icon! Now visible in dark browser themes.
- Fixed wrong title for extension when hovering over the icon
- Fixed issue where tab-titles with urls and spaces caused the tabs to not load

### 0.2.0

- Initial release

## License
MIT
