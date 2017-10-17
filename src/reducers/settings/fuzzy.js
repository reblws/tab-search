import { CHECKBOX_UPDATE, RANGE_UPDATE } from '../../actions/types';
import initialRootState from './initial-settings';

const initialState = initialRootState.fuzzySearch;

export default function fuzzyReducer(state = initialState, action) {
  const type = action.type.split('/')[1];
  const { key, value } = action.payload;
  if (key === 'enableFuzzySearch') {
    return Object.assign({}, state, { [key]: value });
  }
  switch (type) {
    case RANGE_UPDATE:
    case CHECKBOX_UPDATE: {
      const options = Object.assign({}, state.options, { [key]: value });
      return Object.assign({}, state, { options });
    } default:
      return state;
  }
}
