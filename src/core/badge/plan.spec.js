import { badgeChanges, badgeOnStartup, windowBadgeTexts } from './plan.js';

describe('badge plan', function () {
  const DEFAULT = '#FF0000';
  const state = (on, color = DEFAULT) =>
    ({ general: { showTabCountBadgeText: on }, color: { popupBadgeColor: color } });

  describe('badgeChanges', function () {
    it('should start counting when the setting turns on', function () {
      expect(badgeChanges(state(false), state(true), DEFAULT)).to.deep.equal({ counting: 'start', color: null });
    });

    it('should set a custom color when counting starts', function () {
      expect(badgeChanges(state(false), state(true, '#000000'), DEFAULT))
        .to.deep.equal({ counting: 'start', color: '#000000' });
    });

    it('should stop counting when the setting turns off', function () {
      expect(badgeChanges(state(true, '#000000'), state(false, '#000000'), DEFAULT))
        .to.deep.equal({ counting: 'stop', color: null });
    });

    it('should set the color when it changes while counting, even back to the default', function () {
      expect(badgeChanges(state(true, '#000000'), state(true, DEFAULT), DEFAULT))
        .to.deep.equal({ counting: null, color: DEFAULT });
    });

    it('should do nothing for other changes', function () {
      expect(badgeChanges(state(true), state(true), DEFAULT)).to.deep.equal({ counting: null, color: null });
      expect(badgeChanges(state(false), state(false, '#000000'), DEFAULT))
        .to.deep.equal({ counting: null, color: null });
    });
  });

  describe('badgeOnStartup', function () {
    it('should do nothing while the badge is off', function () {
      expect(badgeOnStartup(state(false, '#000000'), DEFAULT)).to.equal(null);
    });

    it('should set only a custom color', function () {
      expect(badgeOnStartup(state(true), DEFAULT)).to.deep.equal({ color: null });
      expect(badgeOnStartup(state(true, '#000000'), DEFAULT)).to.deep.equal({ color: '#000000' });
    });
  });

  describe('windowBadgeTexts', function () {
    it('should give every tab of a window the tab count', function () {
      expect(windowBadgeTexts([{ id: 1 }, { id: 2 }])).to.deep.equal([
        { text: '2', tabId: 1 },
        { text: '2', tabId: 2 },
      ]);
    });
  });
});
