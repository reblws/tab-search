import store, { rehydrated } from 'shell/store/create-store';
import { wrapBackgroundStore } from 'shell/store/bridge';
import { UI_ACTION_TYPES, createActionMap } from 'core/actions/action-map';

export default wrapBackgroundStore({
  store,
  rehydrated,
  actions: createActionMap(UI_ACTION_TYPES),
});
