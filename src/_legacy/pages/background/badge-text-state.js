// Starts and stops the tab count badge as the setting changes.
//
// The badge text lives in the browser, not in the background script, and
// the tab listeners keep it current. So a full recount (one setBadgeText
// per tab) is only needed when counting is turned on, or once per browser
// session. An MV3 service worker restarts after ~30s idle, and recounting on
// every wake was the IPC storm behind reblws/tab-search#117 for users with
// many tabs.

// A boolean that lasts for the browser session. A stopped MV3 service
// worker loses its memory, so keep it in storage.session where there is
// one; an MV2 background page lives for the whole session, so memory is
// enough there.
export function createSessionFlag(key, area = browser.storage.session) {
  if (!area) {
    let value = false;
    return {
      get: () => Promise.resolve(value),
      set: (next) => {
        value = next;
        return Promise.resolve();
      },
    };
  }
  return {
    get: () => area.get(key).then(items => Boolean(items[key])),
    set: next => area.set({ [key]: next }),
  };
}

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
  const applyColor = ({ color }) => {
    if (color.popupBadgeColor !== defaultColor) {
      setBadgeBackgroundColor({ color: color.popupBadgeColor });
    }
  };

  // Wait for the saved settings, not the defaults of a fresh store
  return rehydrated.then(() => {
    let prevState = store.getState();
    store.subscribe(() => {
      const nextState = store.getState();
      const { showTabCountBadgeText } = nextState.general;
      if (showTabCountBadgeText !== prevState.general.showTabCountBadgeText) {
        if (showTabCountBadgeText) {
          start();
          applyColor(nextState);
        } else {
          stop();
        }
      } else if (showTabCountBadgeText
        && nextState.color.popupBadgeColor !== prevState.color.popupBadgeColor) {
        setBadgeBackgroundColor({ color: nextState.color.popupBadgeColor });
      }
      prevState = nextState;
    });

    if (!prevState.general.showTabCountBadgeText) {
      return undefined;
    }
    // A single IPC, so cheap enough on every wake; covers browser restarts
    applyColor(prevState);
    return countedThisSession.get().then(counted => (counted ? undefined : start()));
  });
}
