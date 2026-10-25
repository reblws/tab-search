// Background half of the store, written for MV3 service workers. It speaks
// redux-webext's protocol (constants.js); the popup and settings pages
// connect with createUIStore() from ui-store.js. Unlike redux-webext:
//   - listeners are added synchronously, so the message that wakes a stopped
//     service worker is not lost
//   - replies wait for redux-persist to rehydrate, so the UI never receives
//     the default state of a freshly started worker
import {
  CONNECTION_NAME,
  DISPATCH,
  UPDATE_STATE,
} from './constants';

export function wrapBackgroundStore({ store, rehydrated, actions = {} }) {
  chrome.runtime.onMessage.addListener((msg, sender, reply) => {
    if (msg.type === DISPATCH) {
      const { type, ...actionData } = msg.action;
      // Own keys only, so "constructor" etc. aren't treated as actions.
      // Not Object.hasOwn: Firefox's strict_min_version predates it.
      if (!Object.prototype.hasOwnProperty.call(actions, type)) {
        console.error(`Background store "actions" object doesn't contain "${type}" key.`);
        return undefined;
      }
      const action = actions[type];
      rehydrated.then(() => {
        // if action doesn't have any data we should pass "undefined"
        store.dispatch(action(Object.keys(actionData).length ? actionData : undefined));
      });
    } else if (msg.type === UPDATE_STATE) {
      rehydrated.then(() => reply(store.getState()));
      // keep the channel open until rehydration finishes
      return true;
    }
    return undefined;
  });

  // send updated state to other parts of the app on every change
  chrome.runtime.onConnect.addListener((connection) => {
    if (connection.name !== CONNECTION_NAME) {
      return;
    }
    const unsubscribe = store.subscribe(() => {
      connection.postMessage({ type: UPDATE_STATE, data: store.getState() });
    });
    connection.onDisconnect.addListener(unsubscribe);
  });

  return store;
}
