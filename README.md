# tab-search

Easy tab search & switching. This WebExtension provides a keyboard-accessible search interface for managing your open tabs.

[Get it from Mozilla Addons!](https://addons.mozilla.org/en-US/firefox/addon/tab_search/)

![screenshot](https://user-images.githubusercontent.com/9971847/29625159-f34baa02-87f8-11e7-965d-a76d8262c643.png)

## Keyboard Shortcuts

| Shortcut | Description |
| --- | --- |
| <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> | Toggle extension |
| <kbd>Enter</kbd> | Open selected tab or first in list if not selected |
| <kbd>Up</kbd> / <kbd>Left</kbd> | Select next tab |
| <kbd>Down</kbd> / <kbd>Right</kbd> | Select previous tab |

## Usage

Step 0: If you plan on sending pull-request, you should fork the repository.

Step 1: Clone the [TabSearch](https://github.com/reblws/tab-search) repository.
```
git clone https://github.com/reblws/tab-search.git
```
Step 2:Navigate to the root of the directory you cloned and run:


| Command         | Description                               |
|-----------------|-------------------------------------------|
| `npm install`   | Installs required Node.js dependencies.   |
| `npm run build` | Builds the application for release in Firefox and Chrome, and outputs the files to the `releases/` folder.|
| `npm start`     | Watches for changes made in `src/` and outputs them to `dist/`.  |

## Changelog

### 0.2.1

- New icon! Now visible in dark browser themes.
- Fixed wrong title for extension when hovering over the icon
- Fixed issue where tab-titles with urls and spaces caused the tabs to not load

### 0.2.0

- Initial release

## License
MIT
