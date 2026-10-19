// Returns true if a string contains a single word longer than MAX_LENGTH,
// so it should be word-broken when rendered
const MAX_LENGTH = 40;

export function shouldWordBreak(str) {
  // Some tabs (e.g. unloaded ones on FF 157+) can have an undefined title,
  // see reblws/tab-search#117
  if (!str) return false;
  const longestWordLength = (acc, s) => (s.length > acc)
    ? s.length
    : acc;
  const longest = str.split(/\s/).reduce(longestWordLength, 0);
  return longest > MAX_LENGTH;
}
