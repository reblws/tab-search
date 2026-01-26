import { createWrapStore } from 'webext-redux';
import store from 'core/store';

const wrapStore = createWrapStore();
wrapStore(store);

export default store;
