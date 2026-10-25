/**
 * Helper utilities for WebdriverIO E2E tests of the Chrome (MV3) build.
 * They use chromedriver's CDP passthrough, so no puppeteer-core is needed.
 */

let cachedExtensionId = null;

async function serviceWorkerTargets() {
  const { targetInfos } = await browser.sendCommandAndGetResult('Target.getTargets', {});
  return targetInfos.filter(t => t.type === 'service_worker'
    && t.url.startsWith('chrome-extension://'));
}

/**
 * The extension's details from chrome://extensions, including manifestErrors.
 * Works even if the service worker failed to start.
 */
export async function getExtensionInfo() {
  await browser.url('chrome://extensions');
  const infos = await browser.executeAsync((done) => {
    chrome.developerPrivate.getExtensionsInfo(done);
  });
  // The Chrome manifest adds a suffix to the name (TabSearch: ...)
  const info = infos.find(e => e.name.startsWith('TabSearch'));
  if (!info) {
    throw new Error(`TabSearch is not loaded: ${JSON.stringify(infos)}`);
  }
  return info;
}

/**
 * Get the extension ID from the service worker target URL, falling back to
 * chrome://extensions when the worker isn't running.
 *
 * @returns {Promise<string>} The extension ID
 */
export async function getExtensionId() {
  if (cachedExtensionId) {
    return cachedExtensionId;
  }
  await browser.waitUntil(async () => {
    const [worker] = await serviceWorkerTargets();
    if (worker) {
      cachedExtensionId = new URL(worker.url).host;
    }
    return Boolean(worker);
  }, { timeout: 5000 }).catch(() => {});
  if (!cachedExtensionId) {
    cachedExtensionId = (await getExtensionInfo()).id;
  }
  return cachedExtensionId;
}

export async function extensionUrl(pagePath) {
  return `chrome-extension://${await getExtensionId()}/${pagePath}`;
}

/**
 * Navigate to the extension's popup page in the current tab.
 * Unlike the real popup, this tab shows up in its own tab list.
 */
export async function openPopup() {
  await browser.url(await extensionUrl('popup/index.html'));
}

/**
 * Navigate to the extension's settings page.
 */
export async function openSettings() {
  await browser.url(await extensionUrl('settings/index.html'));
}

export async function isWorkerRunning() {
  return (await serviceWorkerTargets()).length > 0;
}

/**
 * Stop the extension's service worker, as Chrome does when it is idle.
 * Right after browser start the first stopAllWorkers silently does nothing,
 * so keep sending it until the worker target is gone.
 */
export async function stopWorker() {
  await browser.sendCommand('ServiceWorker.enable', {});
  await browser.waitUntil(async () => {
    await browser.sendCommandAndGetResult('ServiceWorker.stopAllWorkers', {});
    await browser.pause(100);
    return !(await isWorkerRunning());
  }, { timeout: 10000, interval: 250, timeoutMsg: 'Service worker still running after stopAllWorkers' });
}

/**
 * Run a chrome.* call from the current extension page and return its result.
 * fn is serialized, so it can't close over test variables; pass them as args.
 */
export function inExtension(fn, ...args) {
  return browser.executeAsync(`
    const done = arguments[arguments.length - 1];
    Promise.resolve((${fn}).apply(null, Array.from(arguments).slice(0, -1)))
      .then(done, e => done({ error: String(e) }));
  `, ...args);
}

/**
 * Open url in a new background tab without switching to it.
 * The browser opens it, so it fires tabs.onCreated like a user action.
 *
 * @returns {Promise<string>} The CDP target ID, for closeTab()
 */
export async function openTab(url) {
  const { targetId } = await browser.sendCommandAndGetResult('Target.createTarget', {
    url,
    background: true,
  });
  return targetId;
}

export async function closeTab(targetId) {
  await browser.sendCommandAndGetResult('Target.closeTarget', { targetId });
}

/**
 * Evaluate an expression in the extension's service worker and return its
 * (awaited) value. chromedriver can't switch into a worker, so this opens a
 * raw CDP session on the browser's debugging socket. It also works when the
 * current window has closed, unlike chromedriver's CDP passthrough.
 */
export async function evaluateInWorker(expression) {
  const { debuggerAddress } = browser.capabilities['goog:chromeOptions'];
  const version = await (await fetch(`http://${debuggerAddress}/json/version`)).json();
  const socket = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let nextId = 0;
  const send = (method, params, sessionId) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const onMessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id !== id) return;
      socket.removeEventListener('message', onMessage);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    };
    socket.addEventListener('message', onMessage);
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
  try {
    const { targetInfos } = await send('Target.getTargets', {});
    const worker = targetInfos.find(t => t.type === 'service_worker'
      && t.url.startsWith('chrome-extension://'));
    if (!worker) {
      throw new Error('The service worker is not running');
    }
    const { sessionId } = await send('Target.attachToTarget', { targetId: worker.targetId, flatten: true });
    const { result, exceptionDetails } = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    }, sessionId);
    if (exceptionDetails) {
      throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
    }
    return result.value;
  } finally {
    socket.close();
  }
}
