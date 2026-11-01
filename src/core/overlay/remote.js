// Firefox runs an extension page that sits in a frame inside a web page with
// only the content script APIs: no tabs, windows, sessions, bookmarks or
// history. The overlay's frame asks the background to make those calls for
// it, and to pass on the tab events it listens for. Chrome gives the frame
// the full API, so this is never used there.

export const REMOTE_CALL = 'tabsearch/remote-call';
export const REMOTE_EVENTS_PORT = 'tabsearch/remote-events';

// Everything the popup page calls or listens to, by namespace. The
// background refuses anything else.
export const REMOTE_API = {
  tabs: {
    methods: ['query', 'get', 'update', 'reload', 'remove', 'create'],
    events: ['onCreated', 'onRemoved', 'onUpdated'],
  },
  windows: { methods: ['getCurrent', 'get', 'update'], events: [] },
  sessions: { methods: ['getRecentlyClosed', 'restore'], events: [] },
  bookmarks: { methods: ['search'], events: [] },
  history: { methods: ['search'], events: [] },
  commands: { methods: ['getAll'], events: [] },
  runtime: { methods: ['getPlatformInfo'], events: [] },
};

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

export function isRemoteMethod(method) {
  const [ns, fn, ...rest] = String(method).split('.');
  return rest.length === 0 && has(REMOTE_API, ns) && REMOTE_API[ns].methods.includes(fn);
}

export function isRemoteEvent(event) {
  const [ns, name, ...rest] = String(event).split('.');
  return rest.length === 0 && has(REMOTE_API, ns) && REMOTE_API[ns].events.includes(name);
}

// What the background calls for the frame's request. "Current window" means
// the background's own last focused window there, so it becomes the window
// of the tab the overlay is in.
// msg: { method: 'tabs.query', args: [...] }; senderTab: the overlay's tab
// Returns { call: ['tabs', 'query'], args } or { error }
export function planRemoteCall(msg, senderTab) {
  if (!msg || !isRemoteMethod(msg.method)) {
    return { error: `TabSearch can't call ${msg && msg.method} for the overlay` };
  }
  const args = Array.isArray(msg.args) ? msg.args : [];
  const [ns, fn] = msg.method.split('.');
  const windowId = senderTab && senderTab.windowId;
  if (ns === 'windows' && fn === 'getCurrent' && Number.isInteger(windowId)) {
    return { call: ['windows', 'get'], args: [windowId, ...args] };
  }
  if (ns === 'tabs' && fn === 'query' && args[0] && args[0].currentWindow
    && Number.isInteger(windowId)) {
    const options = Object.assign({}, args[0], { windowId });
    delete options.currentWindow;
    return { call: ['tabs', 'query'], args: [options] };
  }
  return { call: [ns, fn], args };
}
