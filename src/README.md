# Folder Structure

- `core`: JavaScript modules used in the extension. Contains the webpack entry points inside `core/pages`.
- `static`: Static assets (HTML, CSS, SVG, non-compiled JS) copied over after the webpack build. Files are copied over to the extension zip's root as is.
- `manifest`: Extension manifest, split for different browsers
- `patch`: Patches for `node_modules`, only used if a module breaks an AMO validation test
