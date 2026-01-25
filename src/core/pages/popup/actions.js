import { action } from 'core/actions/action';
import { LAST_QUERY_UPDATE } from 'core/actions/types';

export const updateLastQuery = (newQuery) =>
  action(LAST_QUERY_UPDATE, newQuery);
