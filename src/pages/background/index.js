import backgroundStore from './store';
import addBackgroundListeners from './event-listeners';
import { initializeTabs } from '../../actions/tabs';

const { dispatch } = backgroundStore;

dispatch(initializeTabs());
addBackgroundListeners(dispatch);

