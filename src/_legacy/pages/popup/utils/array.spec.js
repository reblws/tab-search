import {
  identity,
  not,
  isOfType,
  isOfWindow,
  isActive,
  isOfUrl,
  annotateType,
  partition,
  concat,
  getAnnotationFunction,
  annotateTypeConditionally,
  composeFilterAnd,
  composeFilterOr,
} from './array.js';

describe('array utilities', function () {
  describe('identity', function () {
    it('should return the same value', function () {
      expect(identity(5)).to.equal(5);
      expect(identity('test')).to.equal('test');
      expect(identity(null)).to.equal(null);
    });

    it('should return the same object reference', function () {
      const obj = { a: 1 };
      expect(identity(obj)).to.equal(obj);
    });
  });

  describe('not', function () {
    it('should negate a predicate', function () {
      const isPositive = x => x > 0;
      const isNotPositive = not(isPositive);
      expect(isNotPositive(5)).to.equal(false);
      expect(isNotPositive(-5)).to.equal(true);
      expect(isNotPositive(0)).to.equal(true);
    });

    it('should work with truthy/falsy predicates', function () {
      const isTruthy = x => !!x;
      const isFalsy = not(isTruthy);
      expect(isFalsy(0)).to.equal(true);
      expect(isFalsy('')).to.equal(true);
      expect(isFalsy('hello')).to.equal(false);
    });
  });

  describe('isOfType', function () {
    it('should return true when type matches', function () {
      const isTabType = isOfType('tab');
      expect(isTabType({ type: 'tab' })).to.equal(true);
    });

    it('should return false when type does not match', function () {
      const isTabType = isOfType('tab');
      expect(isTabType({ type: 'bookmark' })).to.equal(false);
    });

    it('should return false when type property is missing', function () {
      const isTabType = isOfType('tab');
      expect(isTabType({})).to.equal(false);
    });
  });

  describe('isOfWindow', function () {
    it('should return true when windowId matches', function () {
      const isWindow1 = isOfWindow(1);
      expect(isWindow1({ windowId: 1 })).to.equal(true);
    });

    it('should return false when windowId does not match', function () {
      const isWindow1 = isOfWindow(1);
      expect(isWindow1({ windowId: 2 })).to.equal(false);
    });
  });

  describe('isActive', function () {
    it('should return true when active is true', function () {
      expect(isActive({ active: true })).to.equal(true);
    });

    it('should return false when active is false', function () {
      expect(isActive({ active: false })).to.equal(false);
    });

    it('should return false when active is missing', function () {
      expect(isActive({})).to.equal(false);
    });
  });

  describe('isOfUrl', function () {
    it('should return true when url matches', function () {
      const isGithub = isOfUrl('https://github.com');
      expect(isGithub({ url: 'https://github.com' })).to.equal(true);
    });

    it('should return false when url does not match', function () {
      const isGithub = isOfUrl('https://github.com');
      expect(isGithub({ url: 'https://google.com' })).to.equal(false);
    });
  });

  describe('annotateType', function () {
    it('should add type property to an object', function () {
      const addTabType = annotateType('tab');
      const result = addTabType({ id: 1 });
      expect(result).to.deep.equal({ id: 1, type: 'tab' });
    });

    it('should override existing type property', function () {
      const addTabType = annotateType('tab');
      const result = addTabType({ id: 1, type: 'old' });
      expect(result.type).to.equal('tab');
    });

    it('should not mutate the original object', function () {
      const addTabType = annotateType('tab');
      const original = { id: 1 };
      addTabType(original);
      expect(original).to.not.have.property('type');
    });
  });

  describe('partition', function () {
    it('should partition array based on single predicate', function () {
      const isEven = x => x % 2 === 0;
      const partitionByEven = partition(isEven);
      const result = partitionByEven([1, 2, 3, 4, 5]);
      expect(result).to.deep.equal([[2, 4], [1, 3, 5]]);
    });

    it('should partition array based on multiple predicates', function () {
      const isNegative = x => x < 0;
      const isZero = x => x === 0;
      const partitionBySign = partition(isNegative, isZero);
      const result = partitionBySign([-2, 0, 1, -1, 2]);
      expect(result).to.deep.equal([[-2, -1], [0], [1, 2]]);
    });

    it('should handle empty array', function () {
      const isEven = x => x % 2 === 0;
      const partitionByEven = partition(isEven);
      const result = partitionByEven([]);
      expect(result).to.deep.equal([[], []]);
    });

    it('should place all elements in last partition if no predicates match', function () {
      const isNegative = x => x < 0;
      const partitionByNegative = partition(isNegative);
      const result = partitionByNegative([1, 2, 3]);
      expect(result).to.deep.equal([[], [1, 2, 3]]);
    });

    it('should use first matching predicate for element', function () {
      const isPositive = x => x > 0;
      const isEven = x => x % 2 === 0;
      const partitionFn = partition(isPositive, isEven);
      const result = partitionFn([2, -2, 4]);
      expect(result[0]).to.deep.equal([2, 4]);
      expect(result[1]).to.deep.equal([-2]);
    });
  });

  describe('concat', function () {
    it('should concatenate two arrays', function () {
      const result = concat([1, 2], [3, 4]);
      expect(result).to.deep.equal([1, 2, 3, 4]);
    });

    it('should handle empty arrays', function () {
      expect(concat([], [1, 2])).to.deep.equal([1, 2]);
      expect(concat([1, 2], [])).to.deep.equal([1, 2]);
    });

    it('should work as reducer', function () {
      const arrays = [[1], [2], [3]];
      const result = arrays.reduce(concat, []);
      expect(result).to.deep.equal([1, 2, 3]);
    });
  });

  describe('getAnnotationFunction', function () {
    it('should return annotateType for string type', function () {
      const fn = getAnnotationFunction('tab', {});
      const result = fn({ id: 1 });
      expect(result.type).to.equal('tab');
    });

    it('should call function to get type if type is a function', function () {
      const getType = obj => obj.kind === 'a' ? 'typeA' : 'typeB';
      const fn = getAnnotationFunction(getType, { kind: 'a' });
      const result = fn({ id: 1 });
      expect(result.type).to.equal('typeA');
    });
  });

  describe('annotateTypeConditionally', function () {
    it('should annotate with accepted type when predicate is true', function () {
      const isEven = x => x.value % 2 === 0;
      const annotate = annotateTypeConditionally(isEven, 'even', 'odd');
      const result = annotate({ value: 4 });
      expect(result.type).to.equal('even');
    });

    it('should annotate with rejected type when predicate is false', function () {
      const isEven = x => x.value % 2 === 0;
      const annotate = annotateTypeConditionally(isEven, 'even', 'odd');
      const result = annotate({ value: 3 });
      expect(result.type).to.equal('odd');
    });

    it('should work with function types', function () {
      const isPositive = x => x.value > 0;
      const getPositiveType = obj => `positive-${obj.value}`;
      const annotate = annotateTypeConditionally(isPositive, getPositiveType, 'negative');
      const result = annotate({ value: 5 });
      expect(result.type).to.equal('positive-5');
    });
  });

  describe('composeFilterAnd', function () {
    it('should compose predicates with AND logic', function () {
      const isPositive = x => x > 0;
      const isEven = x => x % 2 === 0;
      const isPositiveAndEven = composeFilterAnd(isPositive, isEven);
      expect(isPositiveAndEven(4)).to.equal(true);
      expect(isPositiveAndEven(3)).to.equal(false);
      expect(isPositiveAndEven(-2)).to.equal(false);
    });

    it('should work with single predicate', function () {
      const isPositive = x => x > 0;
      const composed = composeFilterAnd(isPositive);
      expect(composed(5)).to.equal(true);
      expect(composed(-5)).to.equal(false);
    });

    it('should short-circuit on first false', function () {
      let secondCalled = false;
      const first = () => false;
      const second = () => { secondCalled = true; return true; };
      const composed = composeFilterAnd(first, second);
      composed({});
      expect(secondCalled).to.equal(false);
    });
  });

  describe('composeFilterOr', function () {
    it('should compose predicates with OR logic', function () {
      const isNegative = x => x < 0;
      const isZero = x => x === 0;
      const isNegativeOrZero = composeFilterOr(isNegative, isZero);
      expect(isNegativeOrZero(-1)).to.equal(true);
      expect(isNegativeOrZero(0)).to.equal(true);
      expect(isNegativeOrZero(1)).to.equal(false);
    });

    it('should work with single predicate', function () {
      const isPositive = x => x > 0;
      const composed = composeFilterOr(isPositive);
      expect(composed(5)).to.equal(true);
      expect(composed(-5)).to.equal(false);
    });

    it('should short-circuit on first true', function () {
      let secondCalled = false;
      const first = () => true;
      const second = () => { secondCalled = true; return false; };
      const composed = composeFilterOr(first, second);
      composed({});
      expect(secondCalled).to.equal(false);
    });
  });
});
