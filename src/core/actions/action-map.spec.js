import { UI_ACTION_TYPES, createActionMap } from './action-map.js';
import {
  FUZZY,
  CHECKBOX_UPDATE,
  RANGE_UPDATE,
  SEARCH_KEY_UPDATE,
  LAST_QUERY_UPDATE,
} from './types.js';

describe('createActionMap', function () {
  it('should map all 14 UI action types', function () {
    const map = createActionMap(UI_ACTION_TYPES);
    expect(Object.keys(map)).to.have.length(14);
    expect(map).to.include.keys(
      FUZZY + CHECKBOX_UPDATE,
      FUZZY + RANGE_UPDATE,
      FUZZY + SEARCH_KEY_UPDATE,
      LAST_QUERY_UPDATE,
    );
  });

  it('should return a new action with the mapped type', function () {
    const map = createActionMap([LAST_QUERY_UPDATE]);
    const act = { type: 'other', payload: { key: 'q' } };
    const result = map[LAST_QUERY_UPDATE](act);
    expect(result).to.deep.equal({ type: LAST_QUERY_UPDATE, payload: { key: 'q' } });
    expect(result).to.not.equal(act);
    expect(act.type).to.equal('other');
  });
});
