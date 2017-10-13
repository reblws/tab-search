const baseManifest = require('../src/manifest/base.json');

const targetBrowser = process.argv[2];

switch (targetBrowser) {
  case 'firefox':
    console.log(Object.assign({}, baseManifest, require('../src/manifest/firefox.json')));
    break;
  case 'chrome':
    console.log(Object.assign({}, baseManifest, require('../src/manifest/chrome.json')));
    break;
  default:
    return null;
}

