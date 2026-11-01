// Starts and stops the tab count badge as the setting changes.
//
// The badge text lives in the browser, not in the background script, and
// the tab listeners keep it current. So a full recount (one setBadgeText
// per tab) is only needed when counting is turned on, or once per browser
// session. An MV3 service worker restarts after ~30s idle, and recounting on
// every wake was the IPC storm behind reblws/tab-search#117 for users with
// many tabs.

import { badgeChanges, badgeOnStartup } from 'core/badge/plan';

// Resolves once the startup count (if any) has started
export function watchBadgeTextSetting({
  store,
  rehydrated,
  countedThisSession,
  startCounting,
  stopCounting,
  setBadgeBackgroundColor,
  defaultColor,
}) {
  const start = () => {
    startCounting();
    return countedThisSession.set(true);
  };
  const stop = () => {
    stopCounting();
    return countedThisSession.set(false);
  };
  const setColor = (color) => {
    if (color) setBadgeBackgroundColor({ color });
  };

  // Wait for the saved settings, not the defaults of a fresh store
  return rehydrated.then(() => {
    let prevState = store.getState();
    store.subscribe(() => {
      const nextState = store.getState();
      const { counting, color } = badgeChanges(prevState, nextState, defaultColor);
      if (counting === 'start') start();
      if (counting === 'stop') stop();
      setColor(color);
      prevState = nextState;
    });

    const startup = badgeOnStartup(prevState, defaultColor);
    if (!startup) return undefined;
    // A single IPC, so cheap enough on every wake; covers browser restarts
    setColor(startup.color);
    return countedThisSession.get().then(counted => (counted ? undefined : start()));
  });
}
