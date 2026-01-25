import { clearChildNodes } from './dom';

export const WARNING = 'warning';
export const ERROR = 'error';
export const OK = 'ok';
export const SHORTCUT_FLASH_AREA_ID = 'shortcut-flash';

const styles = {
  [OK]: 'flash-ok',
  [WARNING]: 'flash-warning',
  [ERROR]: 'flash-error',
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

export function appendOk(msg) {
  return message(msg, OK, false);
}

export function message(
  msg,
  type = OK,
  shouldClear = true,
  shouldUpdateStyle = true
) {
  if (typeof msg === 'object' && !Array.isArray(msg)) {
    console.error(
      "Got a msg object but it wasn't an array! msg should be an string or an array."
    );
    return;
  }
  if (!(type in styles) && type !== null) {
    throw new TypeError(
      "Wasn't supplied a correct type! Type must be one of: Flash.OK, Flash.WARNING, Flash.ERROR"
    );
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
      msg
        .map((s) => d.createTextNode(s))
        .forEach((node) => {
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
  flashNode.scrollIntoView();
}

// Given a style, removes all classes not equal to that style in the
// styles object, and then adds that style.
function updateStyle(type, node) {
  const hasStyle = (style) => node.classList.contains(style);
  if (hasStyle(type)) {
    return node;
  }
  Object.keys(styles).forEach((s) => {
    node.classList.remove(s);
  });
  node.classList.add(type);
  return node;
}
