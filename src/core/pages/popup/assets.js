import histSvg from 'static/assets/history-16.svg';
import bkmrkSvg from 'static/assets/bookmark.svg';

// Firefox doesnt like # signs in data uris so hex values are a no-go,
// inline the rgb values instead so the colors show up.
export const BOOKMARK_COLOR = 'rgb(0,31,63)';
export const HISTORY_COLOR = 'rgb(177,13,201)';

const historySvg = histSvg;
const bookmarkSvg = bkmrkSvg;

const historySvgFillStroke = (fill, stroke) =>
  fillAndStroke(historySvg, fill, stroke);
const bookmarkSvgFillStroke = (fill, stroke) =>
  fillAndStroke(bookmarkSvg, fill, stroke);

export const filledHistorySvg = historySvgFillStroke('white', HISTORY_COLOR);
export const filledBookmarkSvg = bookmarkSvgFillStroke(BOOKMARK_COLOR);

// Given a non-base64 encoded data uri of an svg, along with valid-string
// values for the svg fill and stroke attributes, return a new
// svg data uri with the given fill and stroke settings
function fillAndStroke(svgDataUri, fill, stroke) {
  if (!fill && !stroke) {
    return svgDataUri;
  }
  stroke = stroke || fill;
  // Can't replace matched groups directly, just capture what we want
  // saved
  return svgDataUri.replace(
    /(fill=')\w+(' stroke=')\w+(')/,
    function replaceFillStroke(_, m1, m2, m3) {
      // eslint-disable-next-line prefer-string-template
      return m1 + fill + m2 + stroke + m3;
    },
  );
}
