import Fuse from 'fuse.js';
import { initialFuzzySettings } from '../../reducers/defaults.js';
import { JSDOM } from 'jsdom';

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

describe('normalizeRecentlyClosedTabs', function () {
  const session = tab => ({ lastModified: 0, tab: Object.assign({ incognito: false }, tab) });
  let normalizeRecentlyClosedTabs;

  before(async function () {
    // search.js looks up popup elements when it loads
    global.document = new JSDOM('<!DOCTYPE html><html><body></body></html>').window.document;
    ({ normalizeRecentlyClosedTabs } = await import('./search.js'));
  });

  after(function () {
    delete global.document;
  });

  it('should hide new tab pages', function () {
    const results = normalizeRecentlyClosedTabs([
      session({ url: 'about:newtab' }),
      session({ url: 'chrome://newtab/' }),
      session({ url: 'https://example.com/' }),
    ]);
    expect(results.map(t => t.url)).to.deep.equal(['https://example.com/']);
  });

  it('should hide incognito tabs', function () {
    const results = normalizeRecentlyClosedTabs([
      session({ url: 'https://private.example/', incognito: true }),
      session({ url: 'https://example.com/' }),
    ]);
    expect(results.map(t => t.url)).to.deep.equal(['https://example.com/']);
  });

  it('should skip closed windows and annotate tabs as sessions', function () {
    const results = normalizeRecentlyClosedTabs([
      { lastModified: 0, window: { tabs: [] } },
      session({ url: 'https://example.com/' }),
    ]);
    expect(results).to.have.length(1);
    expect(results[0].type).to.equal('session');
  });
});
