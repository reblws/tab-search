# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TabSearch is a WebExtension (browser extension) that provides keyboard-accessible search and management of open browser tabs. It supports both Firefox and Chrome.

## Build Commands

```bash
# Development - watch mode with live reload
npm start                    # Alias for start:firefox
npm run start:firefox        # Watch mode for Firefox
npm run start:chrome         # Watch mode for Chrome
npm run watch:firefox        # Opens Firefox with extension auto-reloading from dist/

# Production builds
npm run build:firefox        # Build + lint for Firefox
npm run build:chrome         # Build + lint for Chrome
npm run zip:firefox          # Build and create distributable zip

# Linting
npm run lint:eslint          # Run ESLint on src/
npm run lint:web-ext         # Validate extension in dist/

# Testing
npm test                     # Run all tests with Mocha
```

## Architecture

### Webpack Entry Points

The extension has three webpack entry points in `src/core/pages/`:
- **popup/** - Main search UI shown when clicking the extension icon
- **background/** - Background script for persistent state and badge management
- **settings/** - Options page for configuring the extension

### State Management

Uses Redux with `redux-webext` for cross-context state sharing between popup and background scripts. State is persisted via `redux-persist` with browser storage.

Redux reducers in `src/core/reducers/`:
- `fuzzy` - Fuse.js search configuration
- `general` - General settings (badge text, etc.)
- `keyboard` - Keyboard shortcut bindings
- `color` - UI color settings
- `state` - Transient runtime state (not persisted)

### Key Modules

- `src/core/keyboard/` - Keyboard shortcut parsing, comparison, and defaults
- `src/core/actions/` - Redux action creators and action types
- `src/core/store/` - Redux store configuration

### Static Assets

`src/static/` contains HTML, CSS, and non-compiled JS that gets copied directly to dist/.

### Browser Manifests

`src/manifest/` contains:
- `base.json` - Shared manifest properties
- `firefox.json` - Firefox-specific additions
- `chrome.json` - Chrome-specific additions

Manifests are merged at build time via `scripts/build-manifest.js`.

### Module Patching

`src/patch/` contains patched node_modules for AMO (addons.mozilla.org) validation compliance.
