import { createUIStore } from 'redux-webext';
import addEventListeners from './event-listeners';
import { populateTabList } from './dom-utils';

// Initialize tabs
createUIStore()
  .then(populateTabList)
  .then(addEventListeners)
  .catch((e) => {
    console.error(e);
    throw new Error(e);
  });
