import { createUIStore } from 'redux-webext';
import { resetSettings } from './actions';
import addInputBindings from './input-bindings';
import { initKeybindingTable, initSettings } from './dom';

addInputBindings();

createUIStore().then((store) => {
  initSettings(store);
  initKeybindingTable(store);
  // Fill in current keyboard setting in table
  document.getElementById('reset-defaults').addEventListener('click', () => {
    store.dispatch(resetSettings());
    location.reload(true);
  });
  return store;
}).catch((e) => {
  throw e;
});
