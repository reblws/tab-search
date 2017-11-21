/* General state that isn't be persisted */

import { initialState } from './defaults';
import { LAST_QUERY_UPDATE } from '../actions/types';

export default function stateReducer(state = initialState, action) {
  const { type, payload } = action;
  if (type === LAST_QUERY_UPDATE) {
    return Object.assign(
      {},
      state,
      { lastQuery: payload },
    );
  }
  return state;
}
