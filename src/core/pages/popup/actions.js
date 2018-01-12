import { action } from 'core/actions/action';
import {
  LAST_QUERY_UPDATE,
} from '../../actions/types';

export const updateLastQuery = newQuery => action(LAST_QUERY_UPDATE, null, newQuery);
