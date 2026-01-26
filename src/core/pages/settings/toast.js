/**
 * Toast Notification System
 * Following Firefox Acorn Design System principles for feedback indicators
 */

export const SUCCESS = 'success';
export const WARNING = 'warning';
export const ERROR = 'error';
export const INFO = 'info';

const TOAST_CONTAINER_ID = 'toast-container';
const AUTO_DISMISS_DELAY = {
  [SUCCESS]: 3000,
  [INFO]: 4000,
  [WARNING]: 5000,
  [ERROR]: 6000,
};

// SVG icons for each toast type (16px, matching Acorn icon specs)
// Using DOMParser to avoid innerHTML assignment warnings from web-ext
const SVG_ICONS = {
  [SUCCESS]: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.354 5.354-4 4a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7 9.293l3.646-3.647a.5.5 0 0 1 .708.708z"/></svg>',
  [WARNING]: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>',
  [ERROR]: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2.5a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4A.75.75 0 0 1 8 3.5zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>',
  [INFO]: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 1 1 0 1.5A.75.75 0 0 1 8 4zm1.5 8h-3a.5.5 0 0 1 0-1h1V7.5h-.5a.5.5 0 0 1 0-1H8a.5.5 0 0 1 .5.5V11h1a.5.5 0 0 1 0 1z"/></svg>',
};

const DISMISS_ICON = '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2.22 2.22a.75.75 0 0 1 1.06 0L6 4.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L7.06 6l2.72 2.72a.75.75 0 1 1-1.06 1.06L6 7.06 3.28 9.78a.75.75 0 0 1-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 0 1 0-1.06z"/></svg>';

const parser = new DOMParser();

function parseSvg(svgString) {
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  return doc.documentElement;
}

let container = null;

function getContainer() {
  if (!container) {
    container = document.getElementById(TOAST_CONTAINER_ID);
    if (!container) {
      container = document.createElement('div');
      container.id = TOAST_CONTAINER_ID;
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
  }
  return container;
}

function createToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');

  const icon = document.createElement('span');
  icon.className = 'toast__icon';
  icon.appendChild(parseSvg(SVG_ICONS[type]));

  const text = document.createElement('span');
  text.className = 'toast__message';
  text.textContent = message;

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'toast__dismiss';
  dismissBtn.setAttribute('aria-label', 'Dismiss');
  dismissBtn.appendChild(parseSvg(DISMISS_ICON));
  dismissBtn.addEventListener('click', () => dismiss(toast));

  toast.appendChild(icon);
  toast.appendChild(text);
  toast.appendChild(dismissBtn);

  return toast;
}

function dismiss(toast) {
  toast.classList.add('toast--dismissing');
  toast.addEventListener('animationend', () => {
    toast.remove();
  });
}

export function show(message, type = INFO) {
  const containerEl = getContainer();
  const toast = createToast(message, type);

  containerEl.appendChild(toast);

  // Trigger entrance animation
  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  // Auto-dismiss
  const delay = AUTO_DISMISS_DELAY[type] || AUTO_DISMISS_DELAY[INFO];
  setTimeout(() => {
    if (toast.parentNode) {
      dismiss(toast);
    }
  }, delay);

  return toast;
}

export function success(message) {
  return show(message, SUCCESS);
}

export function warning(message) {
  return show(message, WARNING);
}

export function error(message) {
  return show(message, ERROR);
}

export function info(message) {
  return show(message, INFO);
}
