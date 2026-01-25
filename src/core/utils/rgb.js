/**
 * Convert hex color to rgb() string
 * @param {string} hex - Hex color (e.g., '#6200a4' or '6200a4')
 * @returns {string} RGB string (e.g., 'rgb(98, 0, 164)')
 */
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}
