// Small DOM helpers. Pages are built with createElement because AMO
// validation flags innerHTML.
const SVG_NS = 'http://www.w3.org/2000/svg';

// el('p', { className: 'x', 'aria-label': 'y' }, 'text', childNode)
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.keys(props).forEach((key) => {
    const value = props[key];
    if (value === undefined || value === null || value === false) return;
    if (key === 'className' || key === 'textContent' || key === 'type') {
      node[key] = value;
    } else if (key === 'dataset') {
      Object.assign(node.dataset, value);
    } else {
      node.setAttribute(key, value === true ? '' : value);
    }
  });
  node.append(...children.filter(c => c !== null && c !== undefined));
  return node;
}

// A 24x24 stroked icon from path data
export function icon(paths, size = 16, strokeWidth = 2) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', String(strokeWidth));
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('aria-hidden', 'true');
  [].concat(paths).forEach((d) => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  });
  return svg;
}

export const CLOSE_ICON = 'M6 6l12 12M18 6 6 18';

export function clearChildNodes(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
  return node;
}
