// Message protocol between the background store (bridge.js) and the UI
// stores (ui-store.js). The values match redux-webext's, which the
// extension used before.
export const CONNECTION_NAME = 'redux-webext';
export const DISPATCH = '@@STORE_DISPATCH';
export const UPDATE_STATE = '@@STORE_UPDATE_STATE';
