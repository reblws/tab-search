// If a website doesn't have a favicon save that favicon's url here so a place
export const badFavIconCache = (function badIcons() {
  const badIconArray = [];
  return () => badIconArray;
}());

export const deletedTabsCache = (function deletedTabs() {
  const deletedTabsArray = [];
  return () => deletedTabsArray;
}());
