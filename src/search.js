import Fuse from 'fuse.js';

export default function filterResults(query) {
  const searchUrl = queryInUrl(query);

  // TODO: Still need to do a strict match for url
  //  Should: Do a filter over strict url maatches
  //  THEN: they should jump to the top of the results,
  //      wrt to their same rankings relative rank to each
  //      other in the original Fuse search.
  //          -> Loop thru the fuse results,
  //              no loops needed, just filter both arrays,
  //              join them (filteredFuse first),
  const options = {
    shouldSort: true,
    // includeMatches: false,
    threshold: 0.7,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['title'],
  };
  const fuse = array => new Fuse(array, options);
  return tabArray => fuse(tabArray).search(query);
}

function queryInUrl(query) {
  return ({ url }) => url.toLowerCase().includes(query);
}
