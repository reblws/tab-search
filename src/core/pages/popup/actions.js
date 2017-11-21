import {
  LAST_QUERY_UPDATE,
} from '../../actions/types';

export function updateLastQuery(newQuery) {
  return {
    type: LAST_QUERY_UPDATE,
    payload: newQuery,
  };
}
