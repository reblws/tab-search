import { createRootReducer } from './root.js';
import { LAST_QUERY_UPDATE } from '../actions/types.js';

const init = { type: '@@INIT' };

describe('root reducer', function () {
  it('should combine every settings slice', function () {
    const state = createRootReducer()(undefined, init);
    expect(state).to.have.all.keys('fuzzy', 'general', 'state', 'keyboard', 'color');
  });

  it('should use the given state slice reducer', function () {
    const stateReducer = (state = { wrapped: true }) => state;
    const state = createRootReducer({ stateReducer })(undefined, init);
    expect(state.state).to.deep.equal({ wrapped: true });
  });

  it('should keep the last query in the default state slice', function () {
    const reducer = createRootReducer();
    const state = reducer(undefined, { type: LAST_QUERY_UPDATE, payload: { key: 'fixture' } });
    expect(state.state.lastQuery).to.equal('fixture');
  });
});
