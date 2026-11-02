import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pin the moz-extension:// UUID so tests can build extension URLs directly
export const EXTENSION_UUID = '0b1c2d3e-0000-4000-8000-000000000001';
const GECKO_ID = '{11a68c03-baa3-41fb-869c-5172c4c4dd2e}';

export const config = {
  runner: 'local',
  specs: ['./test/e2e/**/*.spec.js'],
  exclude: [],

  maxInstances: 1,
  // The browsers run headless, so skip wdio's xvfb-run worker wrapper: on
  // Ubuntu 26.04 it drops the worker IPC fd and every worker dies with
  // "write EINVAL" (webdriverio/webdriverio#15685)
  autoXvfb: false,

  capabilities: [
    {
      browserName: 'firefox',
      // Firefox 158+ refuses WebDriver navigation to moz-extension:// pages
      // unless geckodriver runs with --allow-system-access
      'wdio:geckodriverOptions': { allowSystemAccess: true },
      'moz:firefoxOptions': {
        args: process.env.HEADLESS !== 'false' ? ['-headless'] : [],
        prefs: {
          'extensions.webextensions.uuids': JSON.stringify({ [GECKO_ID]: EXTENSION_UUID }),
          // Overlay scrollbars, as on macOS, drawn even when not scrolling
          'ui.useOverlayScrollbars': 1,
          'layout.testing.overlay-scrollbars.always-visible': true,
        },
      },
    },
  ],

  logLevel: 'warn',
  bail: 0,
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  before: async function () {
    // The Firefox build in dist/, zipped with host access to the overlay
    // specs' fixture server (test/e2e-extension.js). Run
    // `npm run zip:firefox` before running E2E tests to build it
    const { prepareFirefoxExtension } = await import('./test/e2e-extension.js');
    const extensionBase64 = await prepareFirefoxExtension();

    // Install the extension as a temporary addon
    // Store the extension ID for test use
    const extensionId = await browser.installAddOn(extensionBase64, true);
    browser.extensionId = extensionId;
  },
};
