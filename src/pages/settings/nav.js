// Menu: highlights the section in view and filters settings by text

const normalize = text => text.toLowerCase().replace(/\s+/g, ' ').trim();

function cardTitle(card) {
  const title = card.querySelector('h2, h3');
  return title ? normalize(title.textContent) : '';
}

// A setting's text plus any data-keywords it lists for words it doesn't say
const searchText = row => normalize(`${row.textContent} ${row.dataset.keywords || ''}`);

// Hides the settings that don't mention the query. A card whose title
// matches shows all its settings. Returns how many settings are visible.
export function filterSettings(query, root = document) {
  const q = normalize(query);
  let visible = 0;
  root.querySelectorAll('.main .card').forEach((card) => {
    const rows = card.classList.contains('setting') ? [card] : [...card.querySelectorAll('.setting')];
    const showAll = !q || cardTitle(card).includes(q);
    let shown = 0;
    rows.forEach((row) => {
      const show = showAll || searchText(row).includes(q);
      if (row !== card) row.hidden = !show;
      if (show) shown += 1;
    });
    card.hidden = shown === 0;
    visible += shown;
  });
  root.querySelectorAll('.main .group-label, .main .shortcut-head, .main .callout')
    .forEach((node) => { node.hidden = Boolean(q); });
  root.querySelectorAll('.main section.sections').forEach((section) => {
    section.hidden = !section.querySelector('.card:not([hidden])');
  });
  return visible;
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
  const end = start + link.offsetWidth;
  if (start < nav.scrollLeft) {
    nav.scrollLeft = start;
  } else if (end > nav.scrollLeft + nav.clientWidth) {
    nav.scrollLeft = end - nav.clientWidth;
  }
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
    const line = navHeight() + 40;
    let next = 0;
    targets.forEach((target, i) => {
      if (!target || target.hidden) return;
      if (atBottom || target.getBoundingClientRect().top <= line) next = i;
    });
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
