import { planOpen, INJECT, POPUP } from './open-plan.js';

describe('planOpen', function () {
  const tab = url => ({ id: 7, url });
  const opens = (url, browserName) => planOpen(tab(url), browserName).open;

  it('should inject on ordinary web pages in both browsers', function () {
    ['https://github.com/reblws/tab-search', 'http://127.0.0.1:8080/page.html', 'file:///tmp/a.html']
      .forEach((url) => {
        expect(opens(url, 'chrome')).to.equal(INJECT);
        expect(opens(url, 'firefox')).to.equal(INJECT);
      });
  });

  it('should fall back on Chrome pages, the new tab page and the Web Store', function () {
    ['chrome://newtab/', 'chrome://extensions/', 'chrome-extension://abc/popup/index.html',
      'view-source:https://example.com/', 'https://chromewebstore.google.com/category/extensions',
      'https://chrome.google.com/webstore/detail/x', 'about:blank', 'devtools://devtools/x']
      .forEach(url => expect(opens(url, 'chrome'), url).to.equal(POPUP));
  });

  it('should keep the rest of chrome.google.com', function () {
    expect(opens('https://chrome.google.com/intl/en/chrome/', 'chrome')).to.equal(INJECT);
  });

  it('should fall back on Firefox pages and restricted domains', function () {
    ['about:newtab', 'about:home', 'about:reader?url=https://example.com/',
      'moz-extension://uuid/popup/index.html', 'view-source:https://example.com/',
      'https://addons.mozilla.org/en-US/firefox/', 'https://support.mozilla.org/kb/x']
      .forEach(url => expect(opens(url, 'firefox'), url).to.equal(POPUP));
  });

  it('should not treat a lookalike host as restricted', function () {
    expect(opens('https://addons.mozilla.org.example.com/', 'firefox')).to.equal(INJECT);
    expect(opens('https://notchromewebstore.google.com/', 'chrome')).to.equal(INJECT);
  });

  it('should say why it falls back', function () {
    expect(planOpen(tab('about:newtab'), 'firefox')).to.deep.equal({ open: POPUP, reason: 'scheme' });
    expect(planOpen(tab('https://addons.mozilla.org/'), 'firefox'))
      .to.deep.equal({ open: POPUP, reason: 'host' });
  });

  it('should fall back without a tab or a URL', function () {
    expect(planOpen(undefined, 'chrome')).to.deep.equal({ open: POPUP, reason: 'no-tab' });
    expect(planOpen({ id: -1, url: 'https://a.com/' }, 'chrome').reason).to.equal('no-tab');
    expect(planOpen({ id: 3 }, 'chrome')).to.deep.equal({ open: POPUP, reason: 'no-url' });
    expect(planOpen({ id: 3, url: '' }, 'firefox').reason).to.equal('no-url');
  });
});
