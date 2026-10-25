// Side menu: highlights the section in view and filters settings by text

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

function initScrollSpy() {
  const links = [...document.querySelectorAll('.nav__link')];
  const targets = links.map(link => document.querySelector(link.getAttribute('href')));
  let scheduled = false;

  function update() {
    scheduled = false;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = 0;
    targets.forEach((target, i) => {
      if (!target || target.hidden) return;
      if (atBottom || target.getBoundingClientRect().top <= 120) current = i;
    });
    links.forEach((link, i) => {
      if (i === current) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
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
  initFind();
  initScrollSpy();
}
