import { identity } from 'core/lib/fp';

// Returns items => matching items for the query. Fuzzy matching takes its
// index from getIndex(items, options), so the caller decides how to cache it
export function createMatcher(query, options, { sortMruAll, getIndex }) {
  const { enableFuzzySearch, keys: searchKeys } = options;
  if (query.length === 0) {
    return identity;
  }
  if (enableFuzzySearch) {
    let fuseOptions = options;
    // Don't bother fuse sorting if we want to sort by most recently used
    if (sortMruAll) {
      fuseOptions = Object.assign({}, options, { shouldSort: false });
    }
    return arr => getIndex(arr, fuseOptions).search(query).map(result => result.item);
  }
  // If enableFuzzySearch is off
  const matchedTabs = tab => searchKeys.some(
    key => tab[key].toLowerCase().includes(query.toLowerCase()),
  );
  return arr => arr.filter(matchedTabs);
}
