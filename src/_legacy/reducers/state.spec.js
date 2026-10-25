import stateReducer from './state.js';
import { initialState } from './defaults.js';
import { LAST_QUERY_UPDATE } from '../actions/types.js';

describe('stateReducer', function () {
  describe('initial state', function () {
    it('should return initial state when state is undefined', function () {
      const result = stateReducer(undefined, { type: 'UNKNOWN' });
      expect(result).to.deep.equal(initialState);
    });

    it('should have empty lastQuery in initial state', function () {
      const result = stateReducer(undefined, { type: 'UNKNOWN' });
      expect(result.lastQuery).to.equal('');
    });
  });

  describe('LAST_QUERY_UPDATE', function () {
    it('should update lastQuery with the provided key', function () {
      const action = {
        type: LAST_QUERY_UPDATE,
        payload: { key: 'test query' },
      };
      const result = stateReducer(initialState, action);
      expect(result.lastQuery).to.equal('test query');
    });

    it('should update lastQuery to an empty string', function () {
      const state = { lastQuery: 'previous query' };
      const action = {
        type: LAST_QUERY_UPDATE,
        payload: { key: '' },
      };
      const result = stateReducer(state, action);
      expect(result.lastQuery).to.equal('');
    });

    it('should preserve other state properties if they exist', function () {
      const state = { lastQuery: 'old', otherProp: 'value' };
      const action = {
        type: LAST_QUERY_UPDATE,
        payload: { key: 'new query' },
      };
      const result = stateReducer(state, action);
      expect(result.lastQuery).to.equal('new query');
      expect(result.otherProp).to.equal('value');
    });

    it('should handle special characters in query', function () {
      const action = {
        type: LAST_QUERY_UPDATE,
        payload: { key: 'query with spaces & symbols!' },
      };
      const result = stateReducer(initialState, action);
      expect(result.lastQuery).to.equal('query with spaces & symbols!');
    });

    it('should handle unicode characters in query', function () {
      const action = {
        type: LAST_QUERY_UPDATE,
        payload: { key: 'unicode: \u4e2d\u6587' },
      };
      const result = stateReducer(initialState, action);
      expect(result.lastQuery).to.equal('unicode: \u4e2d\u6587');
    });
  });

  describe('unknown action', function () {
    it('should return the current state for unknown actions', function () {
      const state = { lastQuery: 'current query' };
      const action = { type: 'UNKNOWN_ACTION' };
      const result = stateReducer(state, action);
      expect(result).to.deep.equal(state);
    });

    it('should not modify state on unrelated actions', function () {
      const state = { lastQuery: 'unchanged' };
      const action = { type: 'CHECKBOX_UPDATE', payload: { key: 'foo', value: true } };
      const result = stateReducer(state, action);
      expect(result.lastQuery).to.equal('unchanged');
    });
  });
});
