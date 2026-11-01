import {
  isOfType,
  isOfWindow,
  isActive,
  isOfUrl,
} from './predicates.js';

describe('tab predicates', function () {
  describe('isOfType', function () {
    it('should return true when type matches', function () {
      const isTabType = isOfType('tab');
      expect(isTabType({ type: 'tab' })).to.equal(true);
    });

    it('should return false when type does not match', function () {
      const isTabType = isOfType('tab');
      expect(isTabType({ type: 'bookmark' })).to.equal(false);
    });

    it('should return false when type property is missing', function () {
      const isTabType = isOfType('tab');
      expect(isTabType({})).to.equal(false);
    });
  });

  describe('isOfWindow', function () {
    it('should return true when windowId matches', function () {
      const isWindow1 = isOfWindow(1);
      expect(isWindow1({ windowId: 1 })).to.equal(true);
    });

    it('should return false when windowId does not match', function () {
      const isWindow1 = isOfWindow(1);
      expect(isWindow1({ windowId: 2 })).to.equal(false);
    });
  });

  describe('isActive', function () {
    it('should return true when active is true', function () {
      expect(isActive({ active: true })).to.equal(true);
    });

    it('should return false when active is false', function () {
      expect(isActive({ active: false })).to.equal(false);
    });

    it('should return false when active is missing', function () {
      expect(isActive({})).to.equal(false);
    });
  });

  describe('isOfUrl', function () {
    it('should return true when url matches', function () {
      const isGithub = isOfUrl('https://github.com');
      expect(isGithub({ url: 'https://github.com' })).to.equal(true);
    });

    it('should return false when url does not match', function () {
      const isGithub = isOfUrl('https://github.com');
      expect(isGithub({ url: 'https://google.com' })).to.equal(false);
    });
  });
});
