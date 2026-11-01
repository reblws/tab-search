// Menu: highlights the section in view and filters settings by text
import { matchSettings, normalizeText } from 'core/settings/find';
import { activeSection, revealScrollLeft } from 'core/settings/layout';

// A setting's text plus any data-keywords it lists for words it doesn't say
const searchText = row => normalizeText(`${row.textContent} ${row.dataset.keywords || ''}`);

function cardTitle(card) {
  const title = card.querySelector('h2, h3');
  return title ? normalizeText(title.textContent) : '';
}

// Hides the settings that don't mention the query, as core/settings/find.js
// decides. Returns how many settings are visible.
export function filterSettings(query, root = document) {
  const cards = [...root.querySelectorAll('.main .card')];
  // A card can be a single setting itself
  const rows = cards.map(card => (card.classList.contains('setting') ? [card] : [...card.querySelectorAll('.setting')]));
  const match = matchSettings(query, cards.map((card, i) => ({
    title: cardTitle(card),
    rows: rows[i].map(searchText),
  })));
  cards.forEach((card, i) => {
    rows[i].forEach((row, j) => {
      if (row !== card) row.hidden = !match.cards[i][j];
    });
    card.hidden = !match.cards[i].some(Boolean);
  });
  root.querySelectorAll('.main .group-label, .main .shortcut-head, .main .callout')
    .forEach((node) => { node.hidden = Boolean(match.query); });
  root.querySelectorAll('.main section.sections').forEach((section) => {
    section.hidden = !section.querySelector('.card:not([hidden])');
  });
  return match.visible;
}

function initFind() {
  const input = document.getElementById('find');
  const empty = document.getElementById('find-empty');
  const emptyQuery = document.getElementById('find-empty-query');
  const run = () => {
    const visible = filterSettings(input.value);
    empty.hidden = visible > 0;
    emptyQuery.textContent = input.value.trim();
    // The matches are at the top of a shorter page
    window.scrollTo(0, 0);
  };
  input.addEventListener('input', run);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && input.value) {
      event.preventDefault();
      input.value = '';
      run();
    }
  });
}

const navHeight = () => document.querySelector('.page-nav').offsetHeight;

// The pinned menu's height, for scroll-padding-top and the sticky preview
function trackNavHeight() {
  const update = () => {
    document.documentElement.style.setProperty('--nav-height', `${navHeight()}px`);
  };
  update();
  window.addEventListener('resize', update);
}

// Scrolls a menu that overflows sideways (narrow windows) to show the link
function revealLink(nav, link) {
  const start = link.offsetLeft - nav.offsetLeft;
  const scrollLeft = revealScrollLeft({ start, end: start + link.offsetWidth }, nav);
  if (scrollLeft !== null) nav.scrollLeft = scrollLeft;
}

function initScrollSpy() {
  const nav = document.querySelector('.nav');
  const links = [...nav.querySelectorAll('.nav__link')];
  const targets = links.map(link => document.querySelector(link.getAttribute('href')));
  let scheduled = false;
  let current = -1;

  function update() {
    scheduled = false;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    const sections = targets.map(target => target
      && { top: target.getBoundingClientRect().top, hidden: target.hidden });
    const next = activeSection(sections, { line: navHeight() + 40, atBottom });
    if (next === current) return;
    current = next;
    links.forEach((link, i) => {
      if (i === current) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
    revealLink(nav, links[current]);
  }

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
}

export function initNav() {
  trackNavHeight();
  initFind();
  initScrollSpy();
}
