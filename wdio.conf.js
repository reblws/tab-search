import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  runner: 'local',
  specs: ['./test/e2e/**/*.spec.js'],
  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      browserName: 'firefox',
      'moz:firefoxOptions': {
        args: process.env.HEADLESS !== 'false' ? ['-headless'] : [],
      },
    },
  ],

  logLevel: 'warn',
  bail: 0,
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [['geckodriver', {}]],

  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  before: async function () {
    // Path to the built extension .xpi file
    // Run `npm run zip:firefox` before running E2E tests to create this
    const extensionPath = path.resolve(__dirname, './web-ext-artifacts/tabsearch-0.5.0.zip');

    // Read the .xpi file and convert to base64
    const fs = await import('fs/promises');
    const extensionBuffer = await fs.readFile(extensionPath);
    const extensionBase64 = extensionBuffer.toString('base64');

    // Install the extension as a temporary addon
    // Store the extension ID for test use
    const extensionId = await browser.installAddOn(extensionBase64, true);
    browser.extensionId = extensionId;
  },
};
