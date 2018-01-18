import { createUIStore } from 'redux-webext';
import { resetSettings } from './actions';
import addInputBindings from './input-bindings';
import { initKeybindingTable, initSettings } from './dom';

addInputBindings();

const appendOsToStore = store =>
  browser.runtime.getPlatformInfo().then(({ os }) => Object.assign({ os }, store));

createUIStore()
  .then(appendOsToStore)
  .then((store) => {
    initSettings(store);
    initKeybindingTable(store);
    document.getElementById('reset-defaults').addEventListener('click', () => {
      store.dispatch(resetSettings());
      location.reload(true);
    });
    return store;
  }).catch((e) => {
    throw e;
  });
