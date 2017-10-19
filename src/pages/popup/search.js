import Fuse from 'fuse.js';

export default function filterResults(query, options) {
  return tabs => new Fuse(tabs, options).search(query);
}
