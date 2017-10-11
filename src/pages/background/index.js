import backgroundStore from './store';
import addBackgroundListeners from './event-listeners';
import { initializeTabs } from '../../actions';

const { dispatch } = backgroundStore;

dispatch(initializeTabs());
addBackgroundListeners(dispatch);

