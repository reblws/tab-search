import { kbdCommandToString } from 'core/keyboard/to-string';
import {
  SHORTCUT_TABLE_NAME,
  SHORTCUT_TABLE_SHORTCUT,
  SHORTCUT_TABLE_DESCRIPTION,
  SHORTCUT_TABLE_INPUT,
} from './constants';

const d = document;

// Given the entire keyboard-shortcut state, return an array of <tr> nodes
export function stateToTableRows(keyboardState) {
  return Object.keys(keyboardState)
    .map(key => commandToTableRow(keyboardState[key]));
}

// Given an object from the keyboard reducer, output a table row
// for insertion into the settings page
function commandToTableRow({ key, name, command, description }) {
  const trNode = d.createElement('tr');
  trNode.setAttribute('id', key);

  const tdNameNode = d.createElement('td');
  tdNameNode.classList.add(SHORTCUT_TABLE_NAME);
  tdNameNode.appendChild(d.createTextNode(name));

  const tdShortcutNode = d.createElement('td');
  tdShortcutNode.classList.add(SHORTCUT_TABLE_SHORTCUT);

  const inputShortcutNode = d.createElement('input');
  inputShortcutNode.setAttribute('type', 'text');
  inputShortcutNode.classList.add(SHORTCUT_TABLE_INPUT);
  inputShortcutNode.value = kbdCommandToString(command);
  // Input goes inside shortcut td node
  tdShortcutNode.appendChild(inputShortcutNode);

  const tdShortcutDescriptionNode = d.createElement('td');
  tdShortcutDescriptionNode.classList.add(SHORTCUT_TABLE_DESCRIPTION);
  tdShortcutDescriptionNode.appendChild(d.createTextNode(description));

  const trChildren = [tdShortcutNode, tdNameNode, tdShortcutDescriptionNode];
  for (let i = 0; i < trChildren.length; i += 1) {
    const child = trChildren[i];
    trNode.appendChild(child);
  }
  return trNode;
}
