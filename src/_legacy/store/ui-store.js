// UI half of the store, for the popup and settings pages. Same interface as
// redux-webext's createUIStore(), which it replaces: it resolves with
// { subscribe, dispatch, getState } once it has the background's state.
//
// The background pushes every state change over a port. Chrome stops an idle
// MV3 service worker after ~30s and an open port doesn't keep it alive, so
// the port disconnects; the next message wakes a fresh worker that knows
// nothing about this page. redux-webext never noticed and the page kept
// showing stale state forever.
//
// Reconnecting right away would wake the worker every ~30s for as long as a
// settings page stays open, so this reconnects lazily instead:
//   - on dispatch, it connects a new port before sending DISPATCH, then asks
//     for the state, so the page sees its own change even if the worker
//     handled DISPATCH before the new port was registered
//   - when the page is focused or becomes visible, it reconnects and asks
//     for the state, to catch up on changes other pages made meanwhile
// Trade-off: while disconnected, a page that stays visible but unfocused
// (e.g. a window beside the one you're using) doesn't follow changes made
// elsewhere until you focus it. Nothing can be changed on it without
// focusing it first, so it never acts on stale state.
import { CONNECTION_NAME, DISPATCH, UPDATE_STATE } from './constants';

export function createUIStore() {
  let state;
  let listeners = [];
  // null while disconnected
  let port = null;

  function setState(nextState) {
    state = nextState;
    listeners.forEach(l => l());
  }

  function connect() {
    const connection = chrome.runtime.connect({ name: CONNECTION_NAME });
    connection.onMessage.addListener((msg) => {
      if (msg.type === UPDATE_STATE) {
        setState(msg.data);
      }
    });
    connection.onDisconnect.addListener(() => {
      // Read it so Chrome doesn't log an unchecked runtime.lastError
      void chrome.runtime.lastError;
      if (port === connection) {
        port = null;
      }
    });
    port = connection;
  }

  function requestState() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: UPDATE_STATE }, (res) => {
        void chrome.runtime.lastError;
        resolve(res);
      });
    });
  }

  function refresh() {
    requestState().then((res) => {
      if (res) setState(res);
    });
  }

  function reconnectIfNeeded() {
    if (port) return false;
    connect();
    return true;
  }

  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }

  function dispatch(action) {
    const reconnected = reconnectIfNeeded();
    chrome.runtime.sendMessage({ type: DISPATCH, action }, () => {
      void chrome.runtime.lastError;
    });
    if (reconnected) refresh();
  }

  function getState() {
    return state;
  }

  function catchUp() {
    if (reconnectIfNeeded()) refresh();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', catchUp);
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') catchUp();
    });
  }

  connect();
  return requestState().then((res) => {
    state = res;
    return { subscribe, dispatch, getState };
  });
}
