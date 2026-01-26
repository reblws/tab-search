import { kbdCommandToString } from './to-string.js';

describe('kbdCommandToString', function () {
  describe('null input', function () {
    it('should return empty set symbol for null', function () {
      expect(kbdCommandToString(null)).to.equal('\u2205');
    });

    it('should return empty set symbol for null on Mac', function () {
      expect(kbdCommandToString(null, true)).to.equal('\u2205');
    });
  });

  describe('string input', function () {
    it('should return string as-is', function () {
      expect(kbdCommandToString('Enter')).to.equal('Enter');
    });

    it('should return empty string as-is', function () {
      expect(kbdCommandToString('')).to.equal('');
    });
  });

  describe('single key without modifiers', function () {
    it('should uppercase single letter key', function () {
      const command = { key: 'a', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('A');
    });

    it('should keep multi-character keys as-is', function () {
      const command = { key: 'Enter', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Enter');
    });

    it('should keep Escape key as-is', function () {
      const command = { key: 'Escape', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Escape');
    });

    it('should keep Tab key as-is', function () {
      const command = { key: 'Tab', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Tab');
    });
  });

  describe('arrow keys', function () {
    it('should convert ArrowUp to unicode arrow', function () {
      const command = { key: 'ArrowUp', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('\u2191');
    });

    it('should convert ArrowDown to unicode arrow', function () {
      const command = { key: 'ArrowDown', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('\u2193');
    });

    it('should convert ArrowLeft to unicode arrow', function () {
      const command = { key: 'ArrowLeft', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('\u2190');
    });

    it('should convert ArrowRight to unicode arrow', function () {
      const command = { key: 'ArrowRight', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('\u2192');
    });
  });

  describe('Ctrl modifier', function () {
    it('should show Ctrl + key', function () {
      const command = { key: 'a', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Ctrl + A');
    });

    it('should show Ctrl with arrow key', function () {
      const command = { key: 'ArrowDown', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Ctrl + \u2193');
    });
  });

  describe('Alt modifier', function () {
    it('should show Alt + key', function () {
      const command = { key: 'a', ctrlKey: false, altKey: true, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Alt + A');
    });
  });

  describe('Shift modifier', function () {
    it('should show Shift + key', function () {
      const command = { key: 'a', ctrlKey: false, altKey: false, shiftKey: true, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Shift + A');
    });
  });

  describe('Meta modifier (Windows)', function () {
    it('should show Win + key on non-Mac', function () {
      const command = { key: 'a', ctrlKey: false, altKey: false, shiftKey: false, metaKey: true };
      expect(kbdCommandToString(command, false)).to.equal('Win + A');
    });
  });

  describe('Meta modifier (Mac)', function () {
    it('should show Cmd + key on Mac', function () {
      const command = { key: 'a', ctrlKey: false, altKey: false, shiftKey: false, metaKey: true };
      expect(kbdCommandToString(command, true)).to.equal('Cmd + A');
    });
  });

  describe('multiple modifiers', function () {
    it('should show Ctrl + Shift + key', function () {
      const command = { key: 'a', ctrlKey: true, altKey: false, shiftKey: true, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Ctrl + Shift + A');
    });

    it('should show Ctrl + Alt + key', function () {
      const command = { key: 'a', ctrlKey: true, altKey: true, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Ctrl + Alt + A');
    });

    it('should show Ctrl + Shift + Alt + key', function () {
      const command = { key: 'a', ctrlKey: true, altKey: true, shiftKey: true, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Ctrl + Shift + Alt + A');
    });

    it('should show Cmd + Shift + key on Mac', function () {
      const command = { key: 'a', ctrlKey: false, altKey: false, shiftKey: true, metaKey: true };
      expect(kbdCommandToString(command, true)).to.equal('Cmd + Shift + A');
    });

    it('should show Win + Ctrl + Alt + Shift + key', function () {
      const command = { key: 'a', ctrlKey: true, altKey: true, shiftKey: true, metaKey: true };
      expect(kbdCommandToString(command, false)).to.equal('Win + Ctrl + Shift + Alt + A');
    });

    it('should show Cmd + Ctrl + Alt + Shift + key on Mac', function () {
      const command = { key: 'a', ctrlKey: true, altKey: true, shiftKey: true, metaKey: true };
      expect(kbdCommandToString(command, true)).to.equal('Cmd + Ctrl + Shift + Alt + A');
    });
  });

  describe('modifier keys as final key', function () {
    it('should not duplicate Control when it is the key', function () {
      const command = { key: 'Control', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
      const result = kbdCommandToString(command);
      expect(result).to.not.include('Control');
    });

    it('should not duplicate Alt when it is the key', function () {
      const command = { key: 'Alt', ctrlKey: false, altKey: true, shiftKey: false, metaKey: false };
      const result = kbdCommandToString(command);
      expect(result).to.not.include('Alt + Alt');
    });

    it('should not duplicate Shift when it is the key', function () {
      const command = { key: 'Shift', ctrlKey: false, altKey: false, shiftKey: true, metaKey: false };
      const result = kbdCommandToString(command);
      expect(result).to.not.include('Shift + Shift');
    });

    it('should not duplicate Meta when it is the key', function () {
      const command = { key: 'Meta', ctrlKey: false, altKey: false, shiftKey: false, metaKey: true };
      const result = kbdCommandToString(command, true);
      expect(result).to.not.include('Meta');
    });
  });

  describe('special keys', function () {
    it('should handle Backspace', function () {
      const command = { key: 'Backspace', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Ctrl + Backspace');
    });

    it('should handle Delete', function () {
      const command = { key: 'Delete', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Delete');
    });

    it('should handle space key', function () {
      const command = { key: ' ', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('Ctrl +  ');
    });

    it('should handle function keys', function () {
      const command = { key: 'F1', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
      expect(kbdCommandToString(command)).to.equal('F1');
    });
  });
});
