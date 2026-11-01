import { matchSettings, normalizeText } from './find.js';

describe('matchSettings', function () {
  const cards = [
    { title: 'appearance', rows: ['font size', 'popup size'] },
    { title: 'search', rows: ['search urls too', 'fuzzy search'] },
  ];

  it('should show everything for an empty query', function () {
    expect(matchSettings('  ', cards)).to.deep.equal({
      query: '', cards: [[true, true], [true, true]], visible: 4,
    });
  });

  it('should show the settings that mention the query', function () {
    expect(matchSettings('Size', cards)).to.deep.equal({
      query: 'size', cards: [[true, true], [false, false]], visible: 2,
    });
    expect(matchSettings('fuzzy', cards).cards).to.deep.equal([[false, false], [false, true]]);
  });

  it('should show a whole card when its title matches', function () {
    expect(matchSettings('appear', cards).cards).to.deep.equal([[true, true], [false, false]]);
  });

  it('should collapse whitespace when normalizing', function () {
    expect(normalizeText('  Font\n  Size ')).to.equal('font size');
  });
});
