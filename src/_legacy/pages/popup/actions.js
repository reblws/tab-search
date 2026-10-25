import { action } from '_legacy/actions/action';
import { LAST_QUERY_UPDATE } from '_legacy/actions/types';

export const updateLastQuery = newQuery => action(LAST_QUERY_UPDATE, newQuery);
