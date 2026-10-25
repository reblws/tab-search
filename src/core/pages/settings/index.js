import 'core/polyfill';
import { createUIStore } from 'core/store/ui-store';
import { initSettings } from './dom';
import { initKeybindingTable, initBrowserShortcut } from './shortcuts';
import { initPreview } from './preview';
import { initNav } from './nav';

document.getElementById('versioning').textContent =
  `v${browser.runtime.getManifest().version}`;
initNav();

const appendOsToStore = store =>
  browser.runtime.getPlatformInfo().then(({ os }) => Object.assign({ os }, store));

createUIStore()
  .then(appendOsToStore)
  .then((store) => {
    initSettings(store);
    initPreview(store);
    initKeybindingTable(store);
    initBrowserShortcut(store.os);
    return store;
  }).catch((e) => {
    console.error(e);
    console.error(e.stack);
    throw e;
  });
