import Fuse from 'fuse.js';

export default function filterResults(query) {
  const options = {
    shouldSort: true,
    // includeMatches: false,
    threshold: 0.5,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['title', 'url'],
  };
  return tabs => new Fuse(tabs, options).search(query);
}
