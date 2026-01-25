import {
  alphanumerics,
  puncs,
  modifiers,
  arrowKeys,
  ENTER,
  BACKSPACE,
} from './__test__/keys';
import { kbdStringComboRe, kbdStringSingleRe } from './regex';

const single = kbdStringSingleRe;
const combo = kbdStringComboRe;

describe('keyboard.regex', function () {
  describe('kbdStringSingleRe', function () {
    it('should forbid any alphanumeric characters', function () {
      for (let i = 0; i < alphanumerics.length; i++) {
        const alpha = alphanumerics[i];
        expect(alpha).to.not.match(single);
      }
    });
    it('should allow <Equal> (=)', function () {
      expect('=').to.match(single);
    });
    it('should forbid <Backspace>', function () {
      expect(BACKSPACE).to.not.match(single);
    });
    it('should allow allow punctuation to standalone', function () {
      for (let i = 0; i < puncs.length; i++) {
        const punc = puncs[i];
        expect(punc).to.match(single);
      }
    });
    it('should allow navigation keys and <Enter>', function () {
      const keys = [].concat(arrowKeys, ENTER);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        expect(key).to.match(single);
      }
    });
    it('should forbid any random words', function () {
      expect('Sift').to.not.match(single);
      expect('12').to.not.match(single);
      expect('alt').to.not.match(single);
    });
  });
  describe('kbdStringComboRe', function () {
    const allFinalKeys = [].concat(
      alphanumerics,
      puncs,
      arrowKeys,
      ENTER,
      BACKSPACE
    );
    const allKeys = [...allFinalKeys, ...modifiers];
    it('should allow any combination of a single modifier key and alphanumerics/puncs/arrow keys/<Enter>/<Backspace>', function () {
      let i;
      let j;
      for (i = 0; i < modifiers.length; i++) {
        const modifier = modifiers[i];
        for (j = 0; j < allFinalKeys; j++) {
          const alpha = allFinalKeys[j];
          const comboString = modifier + '+' + alpha;
          expect(comboString).to.match(combo);
        }
      }
    });
    it('should allow any 2 modifiers to be combined with a final key', function () {
      let i;
      let j;
      let k;
      for (i = 0; i < modifiers.length; i++) {
        const modifier = modifiers[i];
        for (j = 0; j < modifiers.length; j++) {
          const modifier2 = modifiers[j];
          for (k = 0; k < allFinalKeys.length; k++) {
            const finalKey = allFinalKeys[k];
            const comboString = [modifier, modifier2, finalKey].join('+');
            expect(comboString).to.match(combo);
          }
        }
      }
    });
    it('should forbid any modifiers from being alone', function () {
      let i;
      for (i = 0; i < modifiers.length; i++) {
        expect(modifiers[i]).to.not.match(combo);
      }
    });
    it('should forbid any single characters as valid combinations', function () {
      for (let i = 0; i < allKeys.length; i++) {
        const key = allKeys[i];
        expect(key).to.not.match(combo);
      }
    });
  });
});
