import Fuse from 'fuse.js';
import { initialFuzzySettings } from '../../reducers/defaults.js';

describe('fuzzy search', function () {
  describe('long title search', function () {
    it('should find keywords at the end of long titles', function () {
      const tabs = [
        {
          id: 1,
          title: 'This is an extremely long table title with a unique search string at the end fox',
          url: 'https://example.com',
        },
        {
          id: 2,
          title: 'Another tab',
          url: 'https://other.com',
        },
      ];

      const fuse = new Fuse(tabs, initialFuzzySettings);
      const results = fuse.search('fox');

      expect(results.length).to.equal(1);
      expect(results[0].item.id).to.equal(1);
    });

    it('should find keywords anywhere in the title regardless of position', function () {
      const tabs = [
        {
          id: 1,
          title: 'A'.repeat(50) + ' keyword ' + 'B'.repeat(50),
          url: 'https://example.com',
        },
      ];

      const fuse = new Fuse(tabs, initialFuzzySettings);
      const results = fuse.search('keyword');

      expect(results.length).to.equal(1);
      expect(results[0].item.id).to.equal(1);
    });

    it('should find keywords at position beyond character 20', function () {
      // This test specifically addresses the bug report about
      // search failing after character index 20-21
      const tabs = [
        {
          id: 1,
          // "uniqueword" starts at position 25
          title: '12345678901234567890     uniqueword',
          url: 'https://example.com',
        },
      ];

      const fuse = new Fuse(tabs, initialFuzzySettings);
      const results = fuse.search('uniqueword');

      expect(results.length).to.equal(1);
      expect(results[0].item.id).to.equal(1);
    });
  });
});
