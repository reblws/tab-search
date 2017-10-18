import backgroundStore from './store';
import {
  dispatchCloseWindow,
  dispatchCreateWindow,
  dispatchDeleteTab,
  dispatchCreateTab,
} from './event-listeners';
import { initializeTabs } from '../../actions/tabs';

const { dispatch } = backgroundStore;

dispatch(initializeTabs());
// addBackgroundListeners(dispatch);
browser.windows.onRemoved.addListener(dispatchCloseWindow(dispatch));
browser.windows.onCreated.addListener(dispatchCreateWindow(dispatch));

browser.tabs.onRemoved.addListener(dispatchDeleteTab(dispatch));
browser.tabs.onCreated.addListener(dispatchCreateTab(dispatch));

// browser.tabs.onCreated.addListener
// browser.tabs.onDetached ? browser.tabs.onAttached

