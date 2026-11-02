import { registerToken, claimToken } from './tokens.js';

describe('overlay tokens', function () {
  const token = 'a1b2c3d4-e5f6-4789-abcd-0123456789ab';

  it('should accept a registered token once, in its own tab', function () {
    const tokens = registerToken({}, { token, tabId: 4, now: 1000 });
    expect(claimToken(tokens, { token, tabId: 5, now: 1001 }).valid).to.equal(false);
    const first = claimToken(tokens, { token, tabId: 4, now: 1002 });
    expect(first.valid).to.equal(true);
    expect(claimToken(first.tokens, { token, tabId: 4, now: 1003 }).valid).to.equal(false);
  });

  it('should refuse an expired or unknown token', function () {
    const tokens = registerToken({}, { token, tabId: 4, now: 1000 });
    expect(claimToken(tokens, { token, tabId: 4, now: 20000 }).valid).to.equal(false);
    expect(claimToken(tokens, { token: 'nope-nope-nope-nope', tabId: 4, now: 1001 }).valid).to.equal(false);
  });

  it('should ignore malformed registrations and drop expired ones', function () {
    expect(registerToken({}, { token: 'x', tabId: 4, now: 0 })).to.deep.equal({});
    expect(registerToken({}, { token, tabId: undefined, now: 0 })).to.deep.equal({});
    const old = registerToken({}, { token, tabId: 4, now: 0 });
    const other = 'b1b2c3d4-e5f6-4789-abcd-0123456789ab';
    expect(Object.keys(registerToken(old, { token: other, tabId: 4, now: 60000 }))).to.deep.equal([other]);
  });
});
