// Helpers for handling URLs
export function encodeUrl(url) {
  return encodeURI(url);
}

export function decodeUrl(url) {
  return decodeURI(url);
}

export function parseUrl(url) {
  return new URL(url);
}

// Valid URI schemes for bookmarks
const VALID_SCHEMES = [
  'about',
  'ftp',
  'mailto',
  'file',
  'data',
  'irc',
].map(s => `${s}:`);

// Returns whether this url has a hostname or scheme that lets us travel to it
// like a regular tab
export function hasValidHostname(url) {
  if (!url.hostname) {
    return VALID_SCHEMES.includes(url.protocol);
  }
  return !!url.hostname;
}
