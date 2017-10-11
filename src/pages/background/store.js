import { createBackgroundStore } from 'redux-webext';
import store from '../../store';

export default createBackgroundStore({ store });

// Instead of initializing tabs on browser action, set event listeners here to
// dispatch
