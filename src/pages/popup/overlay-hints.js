// The row of key hints along the bottom of the overlay's panel
import { overlayHints } from 'core/overlay/hints';
import { el } from 'shell/dom/element';
import { getUserOs } from 'shell/platform/os';

export function renderOverlayHints(keyboardState) {
  const render = (isMac) => {
    const items = overlayHints(keyboardState, isMac).map(({ keys, label }) => el(
      'li',
      { className: 'overlay-hints__item' },
      ...keys.map(key => el('kbd', { className: 'overlay-hints__key' }, key)),
      el('span', { className: 'overlay-hints__label' }, label),
    ));
    const footer = el(
      'footer',
      { className: 'overlay-hints', 'aria-hidden': 'true' },
      el('ul', { className: 'overlay-hints__list' }, ...items),
    );
    document.body.append(footer);
  };
  return getUserOs()
    .then(os => os === 'mac', () => false)
    .then(render);
}
