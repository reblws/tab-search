![logo-96](https://user-images.githubusercontent.com/9971847/31857881-e872b1e2-b6b6-11e7-9886-494e8a338a25.png)

# tab-search

Easy tab search & switching. This WebExtension provides a keyboard-accessible search interface for managing your open tabs.

[Get it from Mozilla Addons!](https://addons.mozilla.org/en-US/firefox/addon/tab_search/)

![screenshot](https://user-images.githubusercontent.com/9971847/29625159-f34baa02-87f8-11e7-965d-a76d8262c643.png)

## Shortcuts

| Windows/Linux | macOS | Description |
| --- | --- | --- |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> | Toggle extension |
| <kbd>Ctrl</kbd> + <kbd>Backspace</kbd>/Click | <kbd>Cmd</kbd> + <kbd>Backspace</kbd>/Click | Delete a tab |
| <kbd>Enter</kbd> | <kbd>Enter</kbd> | Open selected tab or first in list if not selected |
| <kbd>Up</kbd> / <kbd>Left</kbd> | <kbd>Up</kbd> / <kbd>Left</kbd> | Select next tab |
| <kbd>Down</kbd> / <kbd>Right</kbd> | <kbd>Down</kbd> / <kbd>Right</kbd> | Select previous tab |

## Usage

These instructions should get you up to compiling with and/or developing with the source. If you just want to use the extension and are on Firefox, you should get the extension from [AMO](https://addons.mozilla.org/en-US/firefox/addon/tab_search/).

Compiling the source requires [node.js](https://nodejs.org/).

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

See (CHANGELOG.md)[CHANGELOG.md].

## License
MIT
