import { encodeUrl, decodeUrl, parseUrl, hasValidHostname } from './url.js';

describe('url utilities', function () {
  describe('encodeUrl', function () {
    it('should encode special characters in URL', function () {
      const url = 'https://example.com/path with spaces';
      const result = encodeUrl(url);
      expect(result).to.equal('https://example.com/path%20with%20spaces');
    });

    it('should double-encode already encoded URLs (encodeURI does not detect prior encoding)', function () {
      const url = 'https://example.com/path%20with%20spaces';
      const result = encodeUrl(url);
      // encodeURI encodes the % character, resulting in double-encoding
      expect(result).to.equal('https://example.com/path%2520with%2520spaces');
    });

    it('should handle URLs with query parameters', function () {
      const url = 'https://example.com/search?q=hello world';
      const result = encodeUrl(url);
      expect(result).to.include('%20');
    });

    it('should preserve basic URL structure', function () {
      const url = 'https://example.com/path';
      const result = encodeUrl(url);
      expect(result).to.equal(url);
    });

    it('should encode unicode characters', function () {
      const url = 'https://example.com/\u4e2d\u6587';
      const result = encodeUrl(url);
      expect(result).to.not.equal(url);
    });
  });

  describe('decodeUrl', function () {
    it('should decode percent-encoded spaces', function () {
      const url = 'https://example.com/path%20with%20spaces';
      const result = decodeUrl(url);
      expect(result).to.equal('https://example.com/path with spaces');
    });

    it('should not decode reserved characters like ? (decodeURI preserves them)', function () {
      // decodeURI does not decode reserved characters like %3F (?)
      // because ? is a valid URI delimiter
      const url = 'https://example.com/test%3Fquery';
      const result = decodeUrl(url);
      expect(result).to.equal('https://example.com/test%3Fquery');
    });

    it('should handle URLs without encoding', function () {
      const url = 'https://example.com/path';
      const result = decodeUrl(url);
      expect(result).to.equal(url);
    });

    it('should decode unicode sequences', function () {
      const encoded = encodeUrl('https://example.com/\u4e2d\u6587');
      const result = decodeUrl(encoded);
      expect(result).to.equal('https://example.com/\u4e2d\u6587');
    });

    it('should be inverse of encodeUrl for valid URLs', function () {
      const original = 'https://example.com/hello world';
      const encoded = encodeUrl(original);
      const decoded = decodeUrl(encoded);
      expect(decoded).to.equal(original);
    });
  });

  describe('parseUrl', function () {
    it('should parse a valid URL', function () {
      const result = parseUrl('https://example.com/path');
      expect(result).to.be.instanceOf(URL);
      expect(result.hostname).to.equal('example.com');
      expect(result.pathname).to.equal('/path');
    });

    it('should parse URL with port', function () {
      const result = parseUrl('https://example.com:8080/path');
      expect(result.port).to.equal('8080');
    });

    it('should parse URL with query string', function () {
      const result = parseUrl('https://example.com/search?q=test');
      expect(result.search).to.equal('?q=test');
    });

    it('should parse URL with hash', function () {
      const result = parseUrl('https://example.com/page#section');
      expect(result.hash).to.equal('#section');
    });

    it('should parse URL with authentication', function () {
      const result = parseUrl('https://user:pass@example.com');
      expect(result.username).to.equal('user');
      expect(result.password).to.equal('pass');
    });

    it('should parse file URLs', function () {
      const result = parseUrl('file:///path/to/file');
      expect(result.protocol).to.equal('file:');
    });

    it('should throw for invalid URLs', function () {
      expect(() => parseUrl('not a url')).to.throw();
    });

    it('should throw for empty string', function () {
      expect(() => parseUrl('')).to.throw();
    });
  });

  describe('hasValidHostname', function () {
    it('should return true for URL with hostname', function () {
      const url = parseUrl('https://example.com');
      expect(hasValidHostname(url)).to.equal(true);
    });

    it('should return true for URL with subdomain', function () {
      const url = parseUrl('https://www.example.com');
      expect(hasValidHostname(url)).to.equal(true);
    });

    it('should return true for localhost', function () {
      const url = parseUrl('http://localhost:3000');
      expect(hasValidHostname(url)).to.equal(true);
    });

    it('should return true for IP address', function () {
      const url = parseUrl('http://192.168.1.1');
      expect(hasValidHostname(url)).to.equal(true);
    });

    it('should return false for file URL', function () {
      const url = parseUrl('file:///path/to/file');
      expect(hasValidHostname(url)).to.equal(false);
    });

    it('should return false for about: URL', function () {
      const url = parseUrl('about:blank');
      expect(hasValidHostname(url)).to.equal(false);
    });

    it('should return false for data: URL', function () {
      const url = parseUrl('data:text/plain,hello');
      expect(hasValidHostname(url)).to.equal(false);
    });

    it('should return false for javascript: URL', function () {
      const url = parseUrl('javascript:void(0)');
      expect(hasValidHostname(url)).to.equal(false);
    });
  });
});
