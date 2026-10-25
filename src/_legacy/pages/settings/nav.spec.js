import { JSDOM } from 'jsdom';
import { filterSettings } from './nav.js';

const FIXTURE = `
  <main class="main">
    <form class="sections">
      <section class="card" id="search">
        <div class="card__header"><h2>Search</h2></div>
        <div class="setting" id="fuzzy">Fuzzy search</div>
        <div class="setting" id="urls">Search URLs too</div>
      </section>
      <section class="card" id="results">
        <div class="card__header"><h2>Results</h2></div>
        <h3 class="group-label">Sources</h3>
        <div class="setting" id="bookmarks" data-keywords="favorites">Bookmarks</div>
        <div class="setting" id="last">Reopen with your last search</div>
      </section>
    </form>
    <section class="sections" id="shortcuts">
      <div class="card setting" id="popup-shortcut"><h3>Open TabSearch</h3></div>
    </section>
  </main>`;

describe('settings find', function () {
  let document;

  beforeEach(function () {
    document = new JSDOM(`<!DOCTYPE html><html><body>${FIXTURE}</body></html>`).window.document;
  });

  const hidden = id => document.getElementById(id).hidden;

  it('should show only matching settings and hide empty sections', function () {
    expect(filterSettings('bookmark', document)).to.equal(1);
    expect(hidden('bookmarks')).to.equal(false);
    expect(hidden('last')).to.equal(true);
    expect(hidden('search')).to.equal(true);
    expect(hidden('shortcuts')).to.equal(true);
    expect(document.querySelector('.group-label').hidden).to.equal(true);
  });

  it('should show a whole section when its title matches', function () {
    // "Open TabSearch" matches too
    expect(filterSettings('  SEARCH ', document)).to.equal(4);
    expect(hidden('fuzzy')).to.equal(false);
    expect(hidden('urls')).to.equal(false);
    expect(hidden('last')).to.equal(false);
    expect(hidden('bookmarks')).to.equal(true);
    expect(hidden('shortcuts')).to.equal(false);
  });

  it('should match a setting by its keywords', function () {
    expect(filterSettings('favorites', document)).to.equal(1);
    expect(hidden('bookmarks')).to.equal(false);
  });

  it('should show everything again when cleared', function () {
    filterSettings('nothing matches this', document);
    expect(filterSettings('', document)).to.equal(5);
    expect(hidden('search')).to.equal(false);
    expect(hidden('shortcuts')).to.equal(false);
  });
});
