import rgb from 'rgb';
import historySvg from 'static/assets/history-16.svg';
import bookmarkSvg from 'static/assets/bookmark.svg';
import { compose } from 'redux';
import { initialColorSettings } from 'core/reducers/defaults';

const {
  bookmarkColor: defaultBookmarkColor,
  historyColor: defaultHistoryColor,
} = initialColorSettings;

// Firefox doesnt like # signs in data uris so hex values are a no-go,
// inline the rgb values instead so the colors show up.
export const DEFAULT_BOOKMARK_COLOR = rgb(defaultBookmarkColor);
export const DEFAULT_HISTORY_COLOR = rgb(defaultHistoryColor);

const fillSvgUri = replaceAttr('fill');
const strokeSvgUri = replaceAttr('stroke');

export function configureSvg(inline) {
  const historyColor = inline.historyColor
    ? rgb(inline.historyColor)
    : DEFAULT_HISTORY_COLOR;
  const bookmarkColor = inline.bookmarkColor
    ? rgb(inline.bookmarkColor)
    : DEFAULT_BOOKMARK_COLOR;
  return {
    historySvg: fillSvgUri(historySvg, historyColor),
    bookmarkSvg: fillAndStroke(bookmarkSvg, bookmarkColor),
  };
}

function replaceAttr(key) {
  return function replace(uri, value) {
    const pattern = new RegExp(`(${key}=')[\\w-_]+(')`);
    return uri.replace(pattern, (_, m1, m2) => m1 + value + m2);
  };
}

// Given a non-base64 encoded data uri of an svg, along with valid-string
// values for the svg fill and stroke attributes, return a new
// svg data uri with the given fill and stroke settings
function fillAndStroke(svgDataUri, fill, stroke) {
  if (!fill && !stroke) {
    return svgDataUri;
  }
  stroke = stroke || fill;
  return compose(x => strokeSvgUri(x, stroke), fillSvgUri)(svgDataUri, fill);
}
