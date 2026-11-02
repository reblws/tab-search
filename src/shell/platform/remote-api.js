// The overlay's frame side of core/overlay/remote.js. In Firefox the frame
// gets only the content script APIs, so withRemoteApi() fills in the missing
// methods and events from REMOTE_API with calls to the background
// (pages/background/remote-api.js). Methods the frame has stay its own.
import {
  REMOTE_API,
  REMOTE_CALL,
  REMOTE_EVENTS_PORT,
} from 'core/overlay/remote';

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// Tab events over one port, opened when the first listener is added
function createEventHub(connect) {
  const listeners = new Map();
  let port = null;

  function ensurePort() {
    if (port) return port;
    port = connect();
    port.onMessage.addListener(({ event, args }) => {
      (listeners.get(event) || []).slice().forEach((l) => {
        try {
          l(...args);
        } catch (e) {
          console.error(`TabSearch overlay: ${event} listener failed: ${e}`);
        }
      });
    });
    port.onDisconnect.addListener(() => {
      port = null;
    });
    return port;
  }

  return function event(name) {
    return {
      addListener(listener) {
        const list = listeners.get(name) || [];
        if (list.includes(listener)) return;
        listeners.set(name, list.concat(listener));
        if (list.length === 0) ensurePort().postMessage({ subscribe: name });
      },
      removeListener(listener) {
        const list = (listeners.get(name) || []).filter(l => l !== listener);
        listeners.set(name, list);
        if (list.length === 0 && port) port.postMessage({ unsubscribe: name });
      },
      hasListener: listener => (listeners.get(name) || []).includes(listener),
    };
  };
}

// Binds native methods, so a call through the proxy runs on the real object
function passThrough(target, key) {
  const value = target[key];
  return typeof value === 'function' ? value.bind(target) : value;
}

// native: the frame's `browser`. Returns it unchanged when nothing is missing
export function withRemoteApi(
  native,
  {
    send = msg => native.runtime.sendMessage(msg),
    connect = () => native.runtime.connect({ name: REMOTE_EVENTS_PORT }),
  } = {},
) {
  const event = createEventHub(connect);
  const call = method => (...args) => send({ type: REMOTE_CALL, method, args })
    .then((reply) => {
      if (!reply) throw new Error(`No reply from the background for ${method}`);
      if (has(reply, 'error')) throw new Error(reply.error);
      return reply.result;
    });

  const namespaces = {};
  Object.keys(REMOTE_API).forEach((ns) => {
    const own = native[ns] || {};
    const filled = {};
    REMOTE_API[ns].methods.forEach((fn) => {
      if (typeof own[fn] !== 'function') filled[fn] = call(`${ns}.${fn}`);
    });
    REMOTE_API[ns].events.forEach((name) => {
      if (!own[name]) filled[name] = event(`${ns}.${name}`);
    });
    if (Object.keys(filled).length > 0) {
      namespaces[ns] = new Proxy(own, {
        get: (target, key) => (has(filled, key) ? filled[key] : passThrough(target, key)),
        has: (target, key) => has(filled, key) || key in target,
      });
    }
  });
  if (Object.keys(namespaces).length === 0) return native;
  return new Proxy(native, {
    get: (target, key) => (has(namespaces, key) ? namespaces[key] : passThrough(target, key)),
    has: (target, key) => has(namespaces, key) || key in target,
  });
}

// Whether this frame lacks the APIs the popup page needs
export const needsRemoteApi = api => !api.tabs || typeof api.tabs.query !== 'function';

// Makes the global `browser` the remote-filled one
export function installRemoteApi() {
  const api = withRemoteApi(globalThis.browser);
  try {
    globalThis.browser = api;
  } catch {
    // Fall through to defineProperty
  }
  if (globalThis.browser !== api) {
    Object.defineProperty(globalThis, 'browser', { value: api, configurable: true, writable: true });
  }
  return api;
}
