const chai = require('chai');
const sinon = require('sinon');

global.expect = chai.expect;
global.sinon = sinon;

// Lazy-load browser mock to avoid issues with ESM
let browserMock = null;

function createBrowserMock() {
  return {
    tabs: {
      query: sinon.stub().resolves([]),
      get: sinon.stub().resolves({}),
      update: sinon.stub().resolves({}),
      remove: sinon.stub().resolves(),
      create: sinon.stub().resolves({}),
      reload: sinon.stub().resolves(),
    },
    windows: {
      getCurrent: sinon.stub().resolves({ id: 1 }),
      getAll: sinon.stub().resolves([{ id: 1 }]),
      update: sinon.stub().resolves({}),
    },
    sessions: {
      restore: sinon.stub().resolves({}),
      getRecentlyClosed: sinon.stub().resolves([]),
    },
    bookmarks: {
      search: sinon.stub().resolves([]),
    },
    history: {
      search: sinon.stub().resolves([]),
    },
    storage: {
      local: {
        get: sinon.stub().resolves({}),
        set: sinon.stub().resolves(),
      },
    },
    runtime: {
      getPlatformInfo: sinon.stub().resolves({ os: 'mac' }),
      getManifest: sinon.stub().returns({
        commands: {
          _execute_browser_action: {
            suggested_key: {
              default: 'Ctrl+Shift+F',
              mac: 'Ctrl+Shift+F',
            },
          },
        },
      }),
    },
    permissions: {
      request: sinon.stub().resolves(true),
      contains: sinon.stub().resolves(false),
    },
  };
}

global.createBrowserMock = createBrowserMock;
global.browser = createBrowserMock();

exports.mochaHooks = {
  beforeEach() {
    global.browser = createBrowserMock();
  },
  afterEach() {
    sinon.restore();
  },
};
