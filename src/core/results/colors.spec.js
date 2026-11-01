import { changedTypeColors } from './colors.js';
import { initialColorSettings } from '../reducers/defaults.js';

describe('changedTypeColors', function () {
  it('should list nothing for the default colors', function () {
    expect(changedTypeColors(initialColorSettings)).to.deep.equal([]);
  });

  it('should list changed row type colors only', function () {
    const colors = Object.assign({}, initialColorSettings, {
      tabColor: '#123456', historyColor: '#abcdef', popupBadgeColor: '#000000',
    });
    expect(changedTypeColors(colors)).to.deep.equal([['tab', '#123456'], ['history', '#abcdef']]);
  });
});
