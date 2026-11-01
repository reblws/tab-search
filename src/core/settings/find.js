// Settings page search

export const normalizeText = text => text.toLowerCase().replace(/\s+/g, ' ').trim();

// Which settings show for a query. A card whose title matches shows all its
// settings; otherwise a setting shows when its text mentions the query.
// cards: [{ title, rows: [text, ...] }], texts already normalized
// Returns { query, cards: [[shown, ...], ...], visible } where query is the
// normalized query and visible counts the settings shown.
export function matchSettings(query, cards) {
  const q = normalizeText(query);
  const shown = cards.map(({ title, rows }) => {
    const showAll = !q || title.includes(q);
    return rows.map(text => showAll || text.includes(q));
  });
  const visible = shown.reduce((sum, rows) => sum + rows.filter(Boolean).length, 0);
  return { query: q, cards: shown, visible };
}
