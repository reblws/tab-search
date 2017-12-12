import { compareKbdCommand } from './compare';
describe('compareKbdCommand', function () {
  it('should return true for two separate but equal objects', function () {
    const c1 = {
      key: 'ArrowDown',
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
    };
    const c2 = {
      key: 'ArrowDown',
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
    };
    expect(c1 === c2).to.be.false;
    expect(compareKbdCommand(c1, c2)).to.be.true;
  });
});
