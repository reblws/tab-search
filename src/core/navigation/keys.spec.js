import { commandBindings, interpretKey } from './keys.js';
import { TAB_NEXT, TAB_PREV, TAB_DELETE, TAB_OPEN } from '../keyboard/constants.js';
import keyboard from '../keyboard/index.js';

describe('commandBindings', function () {
  it('should pair each shortcut with its action, primary ones first', function () {
    const del = keyboard.command('Ctrl+Backspace');
    const open = keyboard.command('Enter');
    const next = keyboard.command('ArrowDown');
    const bindings = commandBindings({
      [TAB_DELETE]: { command: del, secondaryCommand: null },
      [TAB_OPEN]: { command: open, secondaryCommand: next },
    });
    expect(bindings).to.deep.equal([[del, TAB_DELETE], [open, TAB_OPEN], [next, TAB_OPEN]]);
  });
});

describe('interpretKey', function () {
  const press = (key, mods = {}) => Object.assign({
    key, code: '', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
  }, mods);
  const bindings = commandBindings({
    [TAB_NEXT]: { command: keyboard.command('ArrowDown') },
    [TAB_DELETE]: { command: keyboard.command('Ctrl+Backspace') },
  });
  const inList = { searchFocused: false };
  const inSearch = { searchFocused: true };

  it('should run the command bound to the shortcut', function () {
    expect(interpretKey(press('ArrowDown'), bindings, inSearch))
      .to.deep.equal({ preventDefault: true, command: TAB_NEXT });
    expect(interpretKey(press('Backspace', { ctrlKey: true }), bindings, inList))
      .to.deep.equal({ preventDefault: false, command: TAB_DELETE });
  });

  it('should run nothing for a valid shortcut that has no binding', function () {
    expect(interpretKey(press('ArrowUp'), bindings, inList))
      .to.deep.equal({ preventDefault: true, command: undefined });
  });

  it('should dismiss on a bare Escape', function () {
    expect(interpretKey(press('Escape'), bindings, inSearch))
      .to.deep.equal({ preventDefault: false, dismiss: true });
    expect(interpretKey(press('Escape'), bindings, inList))
      .to.deep.equal({ preventDefault: false, dismiss: true });
  });

  it('should not dismiss on Escape with a modifier', function () {
    expect(interpretKey(press('Escape', { shiftKey: true }), bindings, inList).dismiss)
      .to.equal(undefined);
  });

  it('should stop the default of a lone modifier key', function () {
    expect(interpretKey(press('Shift', { shiftKey: true }), bindings, inList).preventDefault)
      .to.equal(true);
  });

  it('should page through results with PageUp and PageDown', function () {
    expect(interpretKey(press('PageDown'), [], inList))
      .to.deep.equal({ preventDefault: true, command: TAB_NEXT });
    expect(interpretKey(press('PageUp'), [], inList))
      .to.deep.equal({ preventDefault: true, command: TAB_PREV });
  });

  it('should move through results with Tab and Shift+Tab', function () {
    expect(interpretKey(press('Tab'), [], inList))
      .to.deep.equal({ preventDefault: true, command: TAB_NEXT });
    expect(interpretKey(press('Tab', { shiftKey: true }), [], inList))
      .to.deep.equal({ preventDefault: true, command: TAB_PREV });
  });

  it('should jump to the ends of the list with Home and End outside the input', function () {
    expect(interpretKey(press('Home'), [], inList)).to.deep.equal({ preventDefault: true, focus: 'first' });
    expect(interpretKey(press('End'), [], inList)).to.deep.equal({ preventDefault: true, focus: 'last' });
  });

  it('should leave Home and End to the search input', function () {
    expect(interpretKey(press('Home'), [], inSearch)).to.deep.equal({ preventDefault: false });
    expect(interpretKey(press('End'), [], inSearch)).to.deep.equal({ preventDefault: false });
  });

  it('should send letters, digits and Backspace to the search input', function () {
    ['a', 'Z', '7', 'Backspace'].forEach((key) => {
      expect(interpretKey(press(key), [], inList)).to.deep.equal({ preventDefault: false, focus: 'search' });
    });
  });

  it('should do nothing for other keys', function () {
    expect(interpretKey(press('é'), [], inList)).to.deep.equal({ preventDefault: false });
  });
});
