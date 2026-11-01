// Chrome has no global `browser`; Firefox keeps its native one.
// Import this first in every entry point so later modules can use `browser`.
import browser from 'webextension-polyfill';

globalThis.browser = browser;
