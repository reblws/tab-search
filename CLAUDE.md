# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TabSearch is a WebExtension (browser extension) that provides keyboard-accessible search and management of open browser tabs. It supports both Firefox (Manifest V2) and Chrome (Manifest V3).

## Build Commands

```bash
# Development - watch mode with live reload
npm start                    # Alias for start:firefox
npm run start:firefox        # Watch mode for Firefox
npm run start:chrome         # Watch mode for Chrome
npm run watch:firefox        # Opens Firefox with extension auto-reloading from dist/

# Production builds
npm run build:firefox        # Build + lint for Firefox
npm run build:chrome         # Build for Chrome (web-ext lint is Firefox-only)
npm run zip:firefox          # Build and create distributable zip
npm run zip:chrome           # Build and create Chrome Web Store zip

# Linting
npm run lint:eslint          # Run ESLint on src/
npm run lint:web-ext         # Validate extension in dist/

# Testing
npm test                     # Run all unit tests (test:core + test:shell) under nyc
npm run test:core            # src/core specs, without the browser mock
npm run test:shell           # src/shell and src/pages specs, with the browser mock
npm run test:e2e             # Firefox E2E (WebdriverIO); run zip:firefox first
npm run test:e2e:chrome      # Chrome E2E on Chrome for Testing; run build:chrome first
npm run test:all             # Lint, unit tests and both E2E suites
```

## Architecture

### Layers

Source is split into three layers. A file's path says whether it may have
side effects, and ESLint (`eslint.config.js`) fails the build when a file
crosses the line.

| Layer | May | May not | May import |
|---|---|---|---|
| `src/core/` | Take data, return data. Use pure libraries (Fuse.js, `redux`'s `combineReducers`). Throw on invalid input. | Touch `browser`, `chrome`, `document`, `window`, `navigator`, storage, `console`, timers, `Date.now()`, `Math.random()`. Hold module-level `let`. Run anything at import time except defining constants and functions. | `core/`, `static/` and pure npm packages |
| `src/shell/` | Wrap one external system each (a browser API, storage, the store, a cache). Hold state. Log. Catch and translate errors. | Know about a specific page's DOM. | `core/`, `shell/`, npm packages |
| `src/pages/` | Be a webpack entry point. Query and mutate the DOM. Wire core functions to shell adapters. | Contain logic that could be a pure function (move it to `core/`), or import another page. | Everything except other pages |

Imports flow one way: `pages/` → `shell/` → `core/`. Babel's
`module-resolver` roots at `src/`, so imports read `core/search`,
`shell/platform/tabs`, `pages/popup/nodes`. Spec files sit next to the
module they test. `npm run test:core` runs `src/core` specs without the
`browser` mock (`test/core-setup.cjs`); `npm run test:shell` runs the rest
with it (`test/setup.cjs`). A core spec that needs `browser` means the code
under test belongs in `shell/`.

Decisions go in `core/`. A page handler gathers plain values
(event fields, row datasets, store state), passes them to a core function
that returns a plan as a value (`{ focus: 2 }`, `{ close: [1, 4] }`,
`{ dispatch: [...] }`, `{ error }`), then applies the plan with few branches
of its own. Examples: `core/navigation/plan.js` for popup commands,
`core/results/row.js` for what a result row shows, `core/settings/inputs.js`
for what a setting change dispatches, `core/badge/plan.js` for the badge.
Test the rules as core specs without test doubles; shell and page specs
only check the wiring.

```
src/
├── core/          # pure: data in, data out
│   ├── actions/   action creators, types, the background action map
│   ├── keyboard/  shortcut parsing, comparison and defaults
│   ├── reducers/  slices, defaults, migrations, root.js (combineReducers)
│   ├── search/    normalize, match, order, extra sources; searchTabs()
│   ├── tabs/      types, predicates, recency (withFocusTimes), menu items,
│   │              duplicates, query options
│   ├── navigation/ popup command plan, key and click intents
│   ├── results/   result row view, list placement and scroll, colors
│   ├── badge/     tab count badge changes and texts
│   ├── surface/   where the popup page runs (popup, preview, overlay,
│   │              window) and what that means for it
│   ├── overlay/   open plan (inject or fall back), protocol, remote API
│   │              list, fallback window bounds, key hints
│   ├── settings/  input map, setting lookup, MRU choice, actions, input
│   │              display and changes, shortcut changes, find, layout
│   └── lib/       fp, url, word-break
├── shell/         # side effects behind small functions
│   ├── platform/  polyfill, action-api, tabs, windows, sessions, bookmarks,
│   │              history, commands, os, recency, tab-menu, scripting,
│   │              remote-api (the Firefox overlay frame's missing APIs)
│   ├── storage/   storage-adapter, persist, session-flag, focus-record,
│   │              memory-area
│   ├── store/     create-store, bridge, ui-store, protocol
│   ├── cache/     tab-cache, fuse-cache, seen-sets
│   └── dom/       element (el, icon, clearChildNodes)
└── pages/         # entry points: DOM + wiring
    ├── popup/     index (entry), nodes (lazy DOM lookups), classnames,
    │              render, events, commands, search, gather, tab-actions, ...
    ├── settings/  index (entry), dom, shortcuts, preview, nav, ...
    ├── overlay/   index (entry), host: the overlay's host in a web page
    └── background/ index (entry), store, badge text, tab-recency,
                   overlay (launcher), remote-api
```

### Webpack Entry Points

The extension has four webpack entry points in `src/pages/`:
- **popup/** - Main search UI shown when clicking the extension icon
- **background/** - Background script for persistent state and badge management
- **settings/** - Options page for configuring the extension
- **overlay/** - Host script the background injects into a tab for the
  experimental overlay (`overlay_bundle.js`)

### Experimental Overlay

`general.enableOverlay` (Settings › Experimental) shows TabSearch centered
over the page instead of in the toolbar popup.

- While it's on, `background/overlay.js` sets the toolbar popup to `''`, so
  the button and its shortcut fire `onClicked`. `core/overlay/open-plan.js`
  decides: inject `overlay_bundle.js` (activeTab, no host permissions), or
  fall back to the toolbar popup on pages the browser protects. The fallback
  sets the popup back, calls `openPopup()` before any `await` (Firefox's
  user action ends at the first one) and opens a popup window
  (`?surface=window`) where the browser refuses.
- `pages/overlay/host.js` adds one `tabsearch-overlay` element with the
  popup page (`?surface=overlay`) in a frame inside its shadow root. The
  frame draws the backdrop and panel; the host shows it once the frame
  posts ready, and falls back (`OVERLAY_FAILED`) if it never does.
  Messages are checked against the frame's window and the extension origin.
- The popup page reads its surface with `core/surface` and closes through
  `closeUI()` (`pages/popup/surface.js`), never `window.close()` directly.
  The toolbar popup still closes at once; the overlay fades out first.
- Firefox runs the overlay's frame with only the content script APIs.
  `shell/platform/remote-api.js` fills in the rest from
  `core/overlay/remote.js`'s list through `background/remote-api.js`, which
  only answers the popup page in a tab's frame. The frame also receives the
  background's state as cross-compartment objects, so `ui-store.js` copies
  it before deep-equal checks see it.
- `globalThis.TabSearchOverlay.open(tab)` in the background opens it as a
  click would. The E2E specs use it, since WebDriver can't click the button;
  `test/e2e-extension.js` gives their copies of the build host access to
  the local fixture server (`test/e2e-fixtures.js`).

### State Management

The Redux store lives in the background (`src/shell/store/create-store.js`).
Popup and settings pages mirror it through `src/shell/store/ui-store.js` (UI
side) and `src/shell/store/bridge.js` (background side), which speak
redux-webext's original message protocol (`src/shell/store/protocol.js`).
State is persisted via `redux-persist` with browser storage
(`src/shell/storage/persist.js` wraps the pure `src/core/reducers/root.js`).

Redux reducers in `src/core/reducers/`:
- `fuzzy` - Fuse.js search configuration
- `general` - General settings (badge text, etc.)
- `keyboard` - Keyboard shortcut bindings
- `color` - UI color settings
- `state` - Transient runtime state (the last query), kept in `storage.session` when available, never in `storage.local`

### Static Assets

`src/static/` contains HTML, CSS, and non-compiled JS that gets copied directly to dist/.

### Browser Manifests

`src/manifest/` contains:
- `base.json` - Shared manifest properties
- `firefox.json` - Firefox-specific additions
- `chrome.json` - Chrome-specific additions

Manifests are merged at build time via `scripts/build-manifest.js`. The merge
is shallow, so keys that differ per browser (`manifest_version`, `background`,
`browser_action`/`action`, `commands`, `options_ui`, `permissions`) live only
in the browser files.

### Chrome (MV3) Notes

- `src/shell/platform/polyfill.js` must be the first import of every entry
  point; it defines `browser` in Chrome.
- `src/shell/platform/action-api.js` picks `browser.action` (MV3) or
  `browser.browserAction` (MV2) and the matching popup command name.
- The background is a service worker that Chrome stops when idle.
  `src/shell/store/bridge.js` adds its listeners synchronously and answers the
  UI only after redux-persist rehydrates. Tab listeners in
  `background/index.js` are also added at top level.
- `background/badge-text-state.js` recounts the tab badge only when the
  setting turns on or once per browser session (a flag in
  `storage.session`, `shell/storage/session-flag.js`), not on every worker
  wake.
- `background/tab-recency.js` records when each tab gets focus (in
  `storage.session`, `shell/storage/focus-record.js`) for the most recently
  used sort; the popup asks for it with `GET_FOCUSED_AT` from
  `core/tabs/recency.js`. `tab.lastAccessed` alone can't order tabs across
  windows.
- A stopped worker disconnects every page's port. `ui-store.js` reconnects
  lazily: before its next dispatch, or when the page is focused or shown.
- Chrome E2E specs live in `test/e2e-chrome/` (config `wdio.chrome.conf.js`);
  `helpers/chrome.js` can stop the service worker through CDP.
- In Firefox's E2E (WebDriver BiDi), enter the overlay's frame with
  `switchFrame()`; `switchToFrame()` silently stays in the page.

### Module Patching

`src/patch/` contains patched node_modules for AMO (addons.mozilla.org) validation compliance.
