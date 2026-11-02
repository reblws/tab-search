// The background's side of core/overlay/remote.js: makes the calls the
// overlay's frame can't make in Firefox, and passes on tab events to it.
// Only the popup page in a tab's frame may ask, and only for REMOTE_API.
import {
  REMOTE_CALL,
  REMOTE_EVENTS_PORT,
  planRemoteCall,
  isRemoteEvent,
} from 'core/overlay/remote';
import { POPUP_PATH } from 'core/overlay/protocol';

function isOverlayFrame(sender) {
  return !!sender
    && sender.id === browser.runtime.id
    && !!sender.tab
    && typeof sender.url === 'string'
    && sender.url.startsWith(browser.runtime.getURL(POPUP_PATH));
}

function lookup(path) {
  const [ns, fn] = path;
  const target = browser[ns];
  return target && typeof target[fn] === 'function' ? target[fn].bind(target) : null;
}

export function handleRemoteCall(msg, sender) {
  if (!isOverlayFrame(sender)) {
    return Promise.resolve({ error: 'Only the TabSearch overlay may call this' });
  }
  const plan = planRemoteCall(msg, sender.tab);
  if (plan.error) return Promise.resolve({ error: plan.error });
  const fn = lookup(plan.call);
  if (!fn) return Promise.resolve({ error: `${plan.call.join('.')} isn't available` });
  return Promise.resolve()
    .then(() => fn(...plan.args))
    .then(result => ({ result }), e => ({ error: String((e && e.message) || e) }));
}

function serveEvents(port) {
  const subscriptions = new Map();
  port.onMessage.addListener((msg) => {
    const name = msg && (msg.subscribe || msg.unsubscribe);
    if (!isRemoteEvent(name)) return;
    const [ns, eventName] = name.split('.');
    const target = browser[ns] && browser[ns][eventName];
    if (!target) return;
    if (msg.subscribe && !subscriptions.has(name)) {
      const forward = (...args) => {
        try {
          port.postMessage({ event: name, args });
        } catch {
          // The frame went away; onDisconnect cleans up
        }
      };
      subscriptions.set(name, forward);
      target.addListener(forward);
    } else if (msg.unsubscribe && subscriptions.has(name)) {
      target.removeListener(subscriptions.get(name));
      subscriptions.delete(name);
    }
  });
  port.onDisconnect.addListener(() => {
    subscriptions.forEach((forward, name) => {
      const [ns, eventName] = name.split('.');
      browser[ns][eventName].removeListener(forward);
    });
    subscriptions.clear();
  });
}

// Add in the background's first turn
export function addRemoteApiListeners() {
  browser.runtime.onMessage.addListener((msg, sender) => {
    if (!msg || msg.type !== REMOTE_CALL) return undefined;
    return handleRemoteCall(msg, sender);
  });
  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== REMOTE_EVENTS_PORT) return;
    if (!isOverlayFrame(port.sender)) {
      port.disconnect();
      return;
    }
    serveEvents(port);
  });
}
