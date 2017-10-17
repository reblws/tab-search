import { CHECKBOX_UPDATE, RANGE_UPDATE } from '../../actions/types';
import initialRootState from './initial-settings';

const initialState = initialRootState.fuzzySearch;

export default function fuzzyReducer(state = initialState, action) {
  const type = action.type.split('/')[1];
  const { key, value } = action.payload;
  switch (type) {
    case RANGE_UPDATE:
      return Object.assign({}, state, { [key]: parseInt(value, 10) });
    case CHECKBOX_UPDATE:
      return Object.assign({}, state, { [key]: value });
    default:
      return state;
  }
}
