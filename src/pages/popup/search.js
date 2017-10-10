import Fuse from 'fuse.js';

export default function filterResults(query) {
  const searchUrl = queryInUrl(query);
  const options = {
    shouldSort: true,
    // includeMatches: false,
    threshold: 0.5,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ['title'],
  };
  const fuse = array => new Fuse(array, options);
  return (tabArray) => {
    const fuseResults = fuse(tabArray).search(query);
    const urlResults = tabArray.filter(searchUrl);
    const headUrlMatches = fuseResults.filter(tab => urlResults.includes(tab));
    const tailUrlMatches = urlResults.filter(tab => !fuseResults.includes(tab));
    const tailMatches = fuseResults.filter(tab => !headUrlMatches.includes(tab));
    return [
      ...headUrlMatches,
      ...tailUrlMatches,
      ...tailMatches,
    ];
  };
}

function queryInUrl(query) {
  return ({ url }) => url.toLowerCase().includes(query);
}
