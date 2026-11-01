# Folder Structure

- `core`: Pure JavaScript modules: data in, data out. No browser APIs, DOM, storage, console, clock or module-level mutable state. The decisions live here: core functions return plans as values that the pages carry out.
- `shell`: Side effects behind small functions: browser APIs, storage, the Redux store, caches and DOM helpers. May import `core`.
- `pages`: The webpack entry points (`popup`, `settings`, `background`) and their DOM code: gather values, ask `core`, apply the answer. May import `shell` and `core`, but not another page.
- `static`: Static assets (HTML, CSS, SVG, non-compiled JS) copied over after the webpack build. Files are copied over to the extension zip's root as is.
- `manifest`: Extension manifest, split for different browsers
- `patch`: Patches for `node_modules`, only used if a module breaks an AMO validation test

Imports flow one way, `pages` → `shell` → `core`, and ESLint enforces it.
