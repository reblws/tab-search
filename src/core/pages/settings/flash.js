import { clearChildNodes } from './dom';
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

export function close() {
  clearChildNodes(flashNode);
  flashNode.style.display = 'none';
}

export function append(msg) {
  return message(msg, null, false, false);
}

export function message(msg, type = OK, shouldClear = true, shouldUpdateStyle = true) {
  if (typeof msg === 'object' && !Array.isArray(msg)) {
    console.error('Got a msg object but it wasn\'t an array! msg should be an string or an array.');
    return;
  }
  if (!(type in styles) && type !== null) {
    throw new TypeError("Wasn't supplied a correct type! Type must be one of: Flash.OK, Flash.WARNING, Flash.ERROR");
  }
  if (shouldClear) {
    clearChildNodes(flashNode);
  }
  if (shouldUpdateStyle) {
    updateStyle(type, flashNode);
  }
  flashNode.style.display = 'block';
  switch (typeof msg) {
    case 'object': {
      const ul = d.createElement('ul');
      ul.classList.add('center');
      msg.map(s => d.createTextNode(s)).forEach((node) => {
        const li = d.createElement('li');
        li.appendChild(node);
        ul.appendChild(li);
      });
      flashNode.appendChild(ul);
      break;
    }
    case 'string':
    default: {
      const p = d.createElement('p');
      p.classList.add('center');
      p.appendChild(d.createTextNode(msg));
      flashNode.appendChild(p);
      break;
    }
  }
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
