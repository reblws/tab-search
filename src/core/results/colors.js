import { initialColorSettings } from '../reducers/defaults';
import { COLOR_PROPERTY_TYPE_MAP } from '../tabs/types';

// The row types whose color differs from the stylesheet's, as
// [type, color] pairs
export function changedTypeColors(colorState) {
  return Object.keys(colorState)
    .filter(key => key in COLOR_PROPERTY_TYPE_MAP
      && colorState[key] !== initialColorSettings[key])
    .map(key => [COLOR_PROPERTY_TYPE_MAP[key], colorState[key]]);
}
