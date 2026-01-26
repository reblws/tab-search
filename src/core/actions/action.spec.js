import { action } from './action.js';

describe('action factory', function () {
  describe('basic action creation', function () {
    it('should create an action with type and payload', function () {
      const result = action('TEST_TYPE', 'testKey', 'testValue');
      expect(result).to.have.property('type', 'TEST_TYPE');
      expect(result).to.have.property('payload');
      expect(result.payload).to.deep.equal({ key: 'testKey', value: 'testValue' });
    });

    it('should create an action with undefined value', function () {
      const result = action('TEST_TYPE', 'testKey', undefined);
      expect(result.payload).to.deep.equal({ key: 'testKey', value: undefined });
    });

    it('should create an action with null value', function () {
      const result = action('TEST_TYPE', 'testKey', null);
      expect(result.payload).to.deep.equal({ key: 'testKey', value: null });
    });

    it('should create an action with undefined key', function () {
      const result = action('TEST_TYPE', undefined, 'testValue');
      expect(result.payload).to.deep.equal({ key: undefined, value: 'testValue' });
    });

    it('should create an action with object value', function () {
      const objValue = { nested: 'object', count: 42 };
      const result = action('TEST_TYPE', 'testKey', objValue);
      expect(result.payload.value).to.deep.equal(objValue);
    });

    it('should create an action with array value', function () {
      const arrValue = ['a', 'b', 'c'];
      const result = action('TEST_TYPE', 'testKey', arrValue);
      expect(result.payload.value).to.deep.equal(arrValue);
    });
  });

  describe('error actions', function () {
    it('should not include error property by default', function () {
      const result = action('TEST_TYPE', 'testKey', 'testValue');
      expect(result).to.not.have.property('error');
    });

    it('should not include error property when error is false', function () {
      const result = action('TEST_TYPE', 'testKey', 'testValue', false);
      expect(result).to.not.have.property('error');
    });

    it('should include error property when error is true', function () {
      const result = action('TEST_TYPE', 'testKey', 'testValue', true);
      expect(result).to.have.property('error', true);
    });
  });

  describe('edge cases', function () {
    it('should handle empty string type', function () {
      const result = action('', 'testKey', 'testValue');
      expect(result.type).to.equal('');
    });

    it('should handle boolean values', function () {
      const result = action('TEST_TYPE', 'boolKey', true);
      expect(result.payload.value).to.equal(true);
    });

    it('should handle numeric values', function () {
      const result = action('TEST_TYPE', 'numKey', 42);
      expect(result.payload.value).to.equal(42);
    });

    it('should handle zero value', function () {
      const result = action('TEST_TYPE', 'numKey', 0);
      expect(result.payload.value).to.equal(0);
    });

    it('should handle empty string key and value', function () {
      const result = action('TEST_TYPE', '', '');
      expect(result.payload).to.deep.equal({ key: '', value: '' });
    });
  });
});
