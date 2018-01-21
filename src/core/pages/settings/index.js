import { createUIStore } from 'redux-webext';
import addInputBindings from './input-bindings';
import { initKeybindingTable, initSettings } from './dom';

addInputBindings();

// Add version info
document.getElementById('versioning').textContent =
  `v${browser.runtime.getManifest().version}`;

const appendOsToStore = store =>
  browser.runtime.getPlatformInfo().then(({ os }) => Object.assign({ os }, store));

createUIStore()
  .then(appendOsToStore)
  .then((store) => {
    initSettings(store);
    initKeybindingTable(store);
    return store;
  }).catch((e) => {
    console.error(e);
    console.error(e.stack);
    throw e;
  });
