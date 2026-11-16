import { Key } from 'webdriverio';

// Runs against the real popup document, both directly and in an overlay
// frame. Only deliberate dot hover discloses the type; row focus stays compact.
export async function expectSwitcherAppearance() {
  await $('.tab-list .tab-object').waitForExist();
  await $('#activeTab .tab-current').waitForExist();
  expect(await $('#activeTab').getAttribute('data-type')).toBe('tab');
  await $('header').moveTo();
  const first = await $('.tab-list .tab-object');
  const original = await browser.execute((row) => {
    const image = row.querySelector('.tab-img img');
    return {
      title: row.querySelector('.tab-title').textContent,
      color: getComputedStyle(row).color,
      urlColor: getComputedStyle(row.querySelector('.tab-url')).color,
      filter: getComputedStyle(image).filter,
      dotColor: getComputedStyle(row.querySelector('.tab-type-dot')).backgroundColor,
    };
  }, first);

  const shown = () => browser.execute(() => {
    const style = getComputedStyle(document.querySelector('.tab-list .tab-type-label'));
    return style.visibility === 'visible' && style.opacity === '1';
  });
  expect(await shown()).toBe(false);
  await first.$('.tab-img').moveTo();
  expect(await shown()).toBe(false);
  await first.$('.tab-type-badge').moveTo();
  await browser.waitUntil(shown, { timeoutMsg: 'Hovering the dot did not reveal the type label' });
  // Pointer can move onto the expanded explanation without losing it.
  await first.$('.tab-type-label').moveTo();
  expect(await shown()).toBe(true);
  await browser.keys(Key.Escape);
  await browser.waitUntil(async () => !(await shown()), { timeoutMsg: 'Escape did not dismiss the explanation' });
  expect(await $('.search').isExisting()).toBe(true);
  await $('header').moveTo();
  await browser.waitUntil(async () => !(await shown()));

  await $('input.search').setValue(original.title);
  await $('.tab-object--selected').waitForExist();
  const selected = await browser.execute(() => {
    const row = document.querySelector('.tab-object--selected');
    return {
      color: getComputedStyle(row).color,
      urlColor: getComputedStyle(row.querySelector('.tab-url')).color,
      background: getComputedStyle(row).backgroundColor,
      boundary: getComputedStyle(row).boxShadow,
      filter: getComputedStyle(row.querySelector('.tab-img img')).filter,
      dotColor: getComputedStyle(row.querySelector('.tab-type-dot')).backgroundColor,
    };
  });
  expect(selected.color).toBe(original.color);
  expect(selected.urlColor).toBe(original.urlColor);
  expect(selected.filter).toBe(original.filter);
  expect(selected.dotColor).toBe(original.dotColor);
  expect(selected.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(selected.boundary).not.toBe('none');

  await browser.keys(Key.ArrowDown);
  await browser.waitUntil(() => browser.execute(() => {
    const row = document.activeElement;
    return row.classList.contains('tab-object');
  }), { timeoutMsg: 'Arrow navigation did not focus a result' });
  expect(await shown()).toBe(false);
  expect(await browser.execute(() => {
    const row = document.activeElement;
    return document.getElementById(row.getAttribute('aria-describedby')).textContent.length > 0;
  })).toBe(true);
  expect(await browser.execute(() => getComputedStyle(document.activeElement).outlineWidth)).toBe('2px');
}
