import { SHORTCUT_FLASH_AREA_ID } from './constants';

export const WARNING = 'warning';
export const ERROR = 'error';
export const OK = 'ok';

const styles = {
  [OK]: {
    backgroundColor: 'bg-lime',
    color: 'black',
  },
  [WARNING]: {
    backgroundColor: 'bg-yellow',
    color: 'black',
  },
  [ERROR]: {
    backgroundColor: 'bg-red',
    color: 'white',
  },
};

const d = document;
const flashNode = d.getElementById(SHORTCUT_FLASH_AREA_ID);
const head = arr => arr[0];

function clear(node) {
  while (node.childNodes.length !== 0) {
    node.removeChild(head(node.childNodes));
  }
}

export function close() {
  clear(flashNode);
  flashNode.style.display = 'none';
}

export function message(msg, type = OK) {
  if (!(type in styles)) {
    throw new TypeError("Wasn't supplied a correct type! Type must be one of: Flash.WARNING, Flash.WARNING, Flash.ERROR");
  }
  clear(flashNode);
  updateStyle(type, flashNode);
  flashNode.style.display = 'block';
  flashNode.appendChild(d.createTextNode(msg));
}

// Given a style, removes all classes not equal to that style in the
// styles object, and then adds that style.
function updateStyle(type, node) {
  const hasStyle = style => node.classList.contains(style);
  if (hasStyle(styles[type].color) && hasStyle(styles[type].backgroundColor)) {
    return node;
  }
  const targetColor = styles[type].color;
  const targetBgColor = styles[type].backgroundColor;
  Object.keys(styles).forEach((key) => {
    const s = styles[key];
    if (key !== type) {
      node.classList.remove(s.color);
      node.classList.remove(s.backgroundColor);
    }
  });
  node.classList.add(targetColor);
  node.classList.add(targetBgColor);
  return node;
}
