import { mruChoice, mruSettings } from './mru.js';

describe('settings mru', function () {
  describe('mruChoice / mruSettings', function () {
    it('should map the two booleans to one choice and back', function () {
      const cases = [
        ['never', false, false],
        ['popup', true, false],
        ['always', true, true],
      ];
      cases.forEach(([choice, onPopup, all]) => {
        const settings = {
          shouldSortByMostRecentlyUsedOnPopup: onPopup,
          shouldSortByMostRecentlyUsedAll: all,
        };
        expect(mruChoice(settings)).to.equal(choice);
        expect(mruSettings(choice)).to.deep.equal(settings);
      });
    });

    it('should treat "all" without "on popup" as never, like the popup does', function () {
      expect(mruChoice({
        shouldSortByMostRecentlyUsedOnPopup: false,
        shouldSortByMostRecentlyUsedAll: true,
      })).to.equal('never');
    });
  });
});
