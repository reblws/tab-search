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
