import { overlayHints } from './hints.js';
import keyboard, { defaultCommands, TAB_NEXT, TAB_PREV, TAB_OPEN, TAB_DELETE } from '../keyboard/index.js';

describe('overlayHints', function () {
  it('should show the default keys as symbols', function () {
    expect(overlayHints(defaultCommands)).to.deep.equal([
      { keys: ['↑', '↓'], label: 'to move' },
      { keys: ['↵'], label: 'to open' },
      { keys: ['Ctrl + ⌫'], label: 'to close a tab' },
      { keys: ['Esc'], label: 'to dismiss' },
    ]);
  });

  it('should follow the user\'s own shortcuts', function () {
    const state = {
      [TAB_NEXT]: { command: keyboard.command('Ctrl+J') },
      [TAB_PREV]: { command: keyboard.command('Ctrl+K') },
      [TAB_OPEN]: { command: keyboard.command('Enter') },
      [TAB_DELETE]: { command: keyboard.command('Alt+W') },
    };
    expect(overlayHints(state)[0]).to.deep.equal({ keys: ['Ctrl + K', 'Ctrl + J'], label: 'to move' });
    expect(overlayHints(state)[2]).to.deep.equal({ keys: ['Alt + W'], label: 'to close a tab' });
  });

  it('should leave out actions without a shortcut', function () {
    expect(overlayHints({})).to.deep.equal([{ keys: ['Esc'], label: 'to dismiss' }]);
  });
});
