import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Unpacked Chrome build. Run `pnpm build:chrome` first.
const extensionPath = path.resolve(__dirname, './dist');

export const config = {
  runner: 'local',
  specs: ['./test/e2e-chrome/**/*.spec.js'],
  exclude: [],

  maxInstances: 1,
  // Where Chrome for Testing and chromedriver are downloaded (CI caches it)
  ...(process.env.WDIO_CACHE_DIR ? { cacheDir: process.env.WDIO_CACHE_DIR } : {}),

  capabilities: [
    {
      browserName: 'chrome',
      // 'stable' makes wdio download Chrome for Testing; branded Chrome 137+
      // ignores --load-extension
      browserVersion: process.env.CHROME_VERSION || 'stable',
      // Classic WebDriver runs these specs about 4x faster than BiDi
      'wdio:enforceWebDriverClassic': true,
      'goog:chromeOptions': {
        args: [
          `--load-extension=${extensionPath}`,
          `--disable-extensions-except=${extensionPath}`,
          '--window-size=1280,900',
          ...(process.env.HEADLESS !== 'false' ? ['--headless=new'] : []),
          // Ubuntu 24.04 AppArmor blocks the Chrome for Testing sandbox
          ...(process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : []),
        ],
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
};
