![logo-96](https://user-images.githubusercontent.com/9971847/31857881-e872b1e2-b6b6-11e7-9886-494e8a338a25.png)

# TabSearch

Easy tab search & switching. This WebExtension provides a keyboard-accessible search interface for managing your open tabs.

[Get it from Mozilla Addons!](https://addons.mozilla.org/en-US/firefox/addon/tab_search/)

![screenshot](https://user-images.githubusercontent.com/9971847/36081161-401e4af4-0f69-11e8-910f-ad89d44a7b5a.png)

## Shortcuts

| Shortcut | Description |
| --- | --- |
| Firefox: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> (Win/Linux), <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> (Mac) / Chrome: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd> (Win/Linux), <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> (Mac) | Toggle extension |
| <kbd>Enter</kbd> | Open selected tab |
| <kbd>&#8593;</kbd> / <kbd>&#8592;</kbd> | Select previous tab |
| <kbd>&#8595;</kbd> / <kbd>&#8594;</kbd> | Select next tab |
| <kbd>Ctrl</kbd> + <kbd>Backspace</kbd> | Delete tab |
| <kbd>Alt</kbd> + <kbd>R</kbd> | Refresh tab |
| <kbd>Alt</kbd> + <kbd>P</kbd> | Pin tab |
| <kbd>Ctrl</kbd> + <kbd>C</kbd> | Copy tab URL |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd> | Delete duplicate tabs |
| <kbd>Alt</kbd> + <kbd>M</kbd> | Toggle mute |

## Development

If you just want to use the extension on Firefox, get it from [AMO](https://addons.mozilla.org/en-US/firefox/addon/tab_search/).

### Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

### Setup

1. Clone the repository (fork first if you plan to submit a pull request):
   ```
   git clone https://github.com/reblws/tab-search.git
   cd tab-search
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

### Development Commands

```bash
# Start development with live reload (Firefox)
pnpm start

# Start development with live reload (Chrome)
pnpm start:chrome

# Run unit tests
pnpm test

# Run E2E tests (Firefox needs `pnpm zip:firefox` first, Chrome needs `pnpm build:chrome`)
pnpm test:e2e
pnpm test:e2e:chrome

# Run the Chrome E2E tests on the oldest supported Chrome
CHROME_VERSION=123 pnpm test:e2e:chrome

# Run every check: lint, unit tests and both E2E suites
pnpm test:all

# Lint code
pnpm lint:eslint
```

### Production Build

```bash
# Build for Firefox
pnpm build:firefox

# Build for Chrome
pnpm build:chrome

# Build and create distributable zip (Firefox)
pnpm zip:firefox

# Build and create Chrome Web Store zip
pnpm zip:chrome
```

The Chrome build uses Manifest V3 with a service worker background. The
Firefox build stays on Manifest V2. The Chrome E2E suite downloads Chrome for
Testing on its first run, because branded Chrome doesn't load unpacked
extensions from the command line.

### Run the built extension manually

Both builds write to `dist/`. Build for the browser you want to use before
loading that directory:

- **Firefox:** run `pnpm build:firefox`, open `about:debugging#/runtime/this-firefox`,
  choose **Load Temporary Add-on**, and select `dist/manifest.json`.
- **Chrome:** run `pnpm build:chrome`, open `chrome://extensions`, enable
  **Developer mode**, choose **Load unpacked**, and select `dist/`.

Open a few tabs and launch TabSearch with the toolbar button or its shortcut.
Search by title or URL, move with the arrow keys, and press Enter to switch.
The color dot at each favicon's top-left identifies the result type. Hover the
dot to reveal its label; Escape dismisses it. Row focus leaves the dot compact,
while screen readers can read its type description. Type colors remain
customizable in Settings.

To try the other surface, enable **Settings → Experimental → Open over the page**
and launch TabSearch over a regular web page. Protected browser pages use the
popup fallback. `pnpm test:all` builds and checks both browsers, including
search, switching, closing tabs, overlay dismissal, and the type badges.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Contributors

Thanks to everyone who has contributed fixes and improvements:

- [@54ac](https://github.com/54ac)
- [@googya](https://github.com/googya)
- [@wilmtang](https://github.com/wilmtang)

## License
MIT
