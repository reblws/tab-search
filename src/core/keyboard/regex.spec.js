import {
  kbdStringComboRe,
  kbdStringSingleRe,
} from './regex';

const single = kbdStringSingleRe;
const combo = kbdStringComboRe;

describe('keyboard.regex', function() {
  const alphanumerics = ['a', 'b', 'c', 'g', 'f', '1', '2', '3', '0']
    .map(s => s.toUpperCase());
  const puncs = [
    '.', ',', '/', '\'', ';', '[', ']', '\\', '-', '=', '`',
  ];
  const modifiers = [
    'Alt', 'Shift', 'Ctrl', 'Meta'
  ];
  const arrowKeys = [
    'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown',
  ];
  const ENTER = 'Enter';
  const BACKSPACE = 'Backspace';


  describe('kbdStringSingleRe', function() {
    it('should forbid any alphanumeric characters', function() {
      for (let i = 0; i < alphanumerics.length; i++) {
        const alpha = alphanumerics[i];
        expect(alpha).to.not.match(single);
      }
    });
    it('should forbid <Backspace>', function() {
      expect(BACKSPACE).to.not.match(single);
    });
    it('should allow allow punctuation to standalone', function() {
      for (let i = 0; i < puncs.length; i++) {
        const punc = puncs[i];
        expect(punc).to.match(single);
      }
    });
    it('should allow navigation keys and <Enter>', function() {
      const keys = [].concat(arrowKeys, ENTER);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        expect(key).to.match(single);
      }
    });
  });
  describe('kbdStringComboRe', function() {
    const allFinalKeys = [].concat(
      alphanumerics, puncs, arrowKeys, ENTER, BACKSPACE,
    );
    const allKeys = [...allFinalKeys, ...modifiers];
    it('should not identify any single characters as valid combinations', function() {
      for (let i = 0; i < allKeys.length; i++){
        const key = allKeys[i];
        expect(key).to.not.match(combo);
      }
    });
    it('should allow any combination of a single modifier key and alphanumerics/puncs/arrow keys/<Enter>/<Backspace>', function() {
      let i;
      let j;
      for (i = 0; i < modifiers.length; i++) {
        const modifier = modifiers[i];
        for (j = 0 ; j < allFinalKeys; j++) {
          const alpha = allFinalKeys[j];
          const comboString = modifier + '+' + alpha;
          expect(comboString).to.match(combo);
        }
      }
    });
    it('should allow any 2 modifiers to be combined with a final key', function() {
      let i;
      let j;
      let k;
      for (i = 0; i < modifiers.length; i++) {
        const modifier = modifiers[i];
        for (j = 0; i < modifiers.length; j++) {
          if (i === j) continue;
          const modifier2 = modifiers[j];
          for (k = 0; k < allFinalKeys.length; k++) {
            const finalKey = allFinalKeys[k];
            const comboString = [modifier, modifier2, finalKey].join('+');
            expect(comboString).to.match(combo);
          }
        }
      }
    })
  });
});

/*
Valid strings:
- Ctrl + S
  - Ctrl + M
  - Ctrl + Z
  - Alt + Z
  - Alt+U
  - Ctrl+Shift+M
  - Alt+Shift+A
  - Shift+Alt+C
  - Meta+S
  - Shift+C
  - Alt+;

Invalid strings:
 - Ctrl+
 - Crtl+Z
 - Zaz
 - Wack
 - Shift+Keyboard
 - Ctrl+Shift
*/
