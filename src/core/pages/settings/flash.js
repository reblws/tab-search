import { SHORTCUT_FLASH_AREA_ID } from './constants';

const d = document;
const domNode = d.getElementById(SHORTCUT_FLASH_AREA_ID);
const head = arr => arr[0];

function clear() {
  while (domNode.childNodes.length !== 0) {
    domNode.removeChild(head(domNode.childNodes));
  }
}

export function close() {
  clear();
  domNode.style.display = 'none';
}

export function message(msg) {
  clear();
  domNode.style.display = 'block';
  domNode.appendChild(d.createTextNode(msg));
}
