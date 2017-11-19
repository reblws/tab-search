/*
Key mappings from input id names to corresponding reducer state.
This works as long as these two reducers are only a flat 1-level object
*/
import {
  initialFuzzySettings,
  initialGeneralSettings,
} from 'core/reducers/defaults';


const settingSkeleton = {
  fuzzy: Object.keys(initialFuzzySettings),
  general: Object.keys(initialGeneralSettings),
};

/*
1. Map (x -> 'fuzzy.' + x)

[
  enableFuzzySearch,
  shouldSort,
  threshold,
  maxPatternLength,
  minMatchCharLength,
  keys
]
*/

const skeleton = {
  fuzzy: Object.keys(initialFuzzySettings),
  general: Object.keys(initialGeneralSettings),
};

export default Object.keys(skeleton).reduce((acc, keyPrefix) => {
  const values = skeleton[keyPrefix];
  return Object.assign(
    {},
    acc,
    values.reduce((settingAcc, setting) => {
      // In the form showUrls is in charge of changing the 'keys' prop in reducer
      const settingKey = (setting !== 'keys')
        ? setting
        : 'showUrls';
      return Object.assign(
        {},
        settingAcc,
        { [settingKey]: `${keyPrefix}.${setting}` },
      );
    }, {}),
  );
}, {});

// export default {
//   showLastQueryOnPopup: 'general.showLastQueryOnPopup',
//   showTabCountBadgeText: 'general.showTabCountBadgeText',
//   showRecentlyClosed: 'general.showRecentlyClosed',
//   searchAllWindows: 'general.searchAllWindows',
//   alwaysShowRecentlyClosedAtTheBottom: 'general.alwaysShowRecentlyClosedAtTheBottom',
//   recentlyClosedLimit: 'general.recentlyClosedLimit',
//   enableOverlay: 'general.enableOverlay',
//   useFallbackFont: 'general.useFallbackFont',
//   enableFuzzySearch: 'fuzzy.enableFuzzySearch',
//   shouldSort: 'fuzzy.shouldSort',
//   threshold: 'fuzzy.threshold',
//   showUrls: 'fuzzy.keys', // Modifies 'keys'
// };
