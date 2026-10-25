import { shouldWordBreak } from './word-break';

// Regression test for the FF 157+ (Nova) empty-popup bug
// (reblws/tab-search#117): tabs that are not loaded can have an undefined
// title, and shouldWordBreak used to throw
// `TypeError: can't access property "split", str is undefined` — the
// exception aborted the whole tab list injection, leaving the popup blank.
describe('shouldWordBreak', function () {
  // The exact crash from the bug report: unloaded tab with no title
  it('should not throw on an undefined title', function () {
    expect(() => shouldWordBreak(undefined)).to.not.throw();
    expect(shouldWordBreak(undefined)).to.equal(false);
  });

  it('should not throw on a null or empty title', function () {
    expect(shouldWordBreak(null)).to.equal(false);
    expect(shouldWordBreak('')).to.equal(false);
  });

  it('should word-break titles with a single word over 40 chars', function () {
    expect(shouldWordBreak('A'.repeat(41))).to.equal(true);
  });

  it('should not word-break normal titles', function () {
    expect(shouldWordBreak('GitHub where the world builds software')).to.equal(false);
  });

  it('should not word-break titles whose longest word is 40 chars', function () {
    expect(shouldWordBreak('A'.repeat(40))).to.equal(false);
  });
});
