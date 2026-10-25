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

// Returns whether this url has a hostname or scheme that lets us travel to it
// like a regular tab
export function hasValidHostname(url) {
  return !!url.hostname;
}
