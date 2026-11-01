import { apiP } from './api';

export function queryTabs(queryOptions) {
  return apiP(browser.tabs, 'query', queryOptions);
}

export function queryTab(id) {
  return apiP(browser.tabs, 'get', parseInt(id, 10));
}

export function activateTab(id) {
  return apiP(browser.tabs, 'update', parseInt(id, 10), { active: true });
}

export function reloadTab(id) {
  return apiP(browser.tabs, 'reload', parseInt(id, 10));
}

export function pinTab(id, pinned) {
  return apiP(browser.tabs, 'update', parseInt(id, 10), { pinned });
}

export function muteTab(id, muted) {
  return apiP(browser.tabs, 'update', parseInt(id, 10), { muted });
}

export function removeTab(id) {
  return browser.tabs.remove(id);
}

export function createTab(createOptions) {
  return apiP(browser.tabs, 'create', createOptions);
}
