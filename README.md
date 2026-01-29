![logo-96](https://user-images.githubusercontent.com/9971847/31857881-e872b1e2-b6b6-11e7-9886-494e8a338a25.png)

# TabSearch

Easy tab search & switching. This WebExtension provides a keyboard-accessible search interface for managing your open tabs.

[Get it from Mozilla Addons!](https://addons.mozilla.org/en-US/firefox/addon/tab_search/)

![screenshot](https://user-images.githubusercontent.com/9971847/36081161-401e4af4-0f69-11e8-910f-ad89d44a7b5a.png)

## Shortcuts

| Shortcut | Description |
| --- | --- |
| Win/Linux: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd> / Mac: <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> | Toggle extension |
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

# Run tests
pnpm test

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
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License
MIT
