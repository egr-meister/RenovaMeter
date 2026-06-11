// Formatting helpers used across the app.

// Round a number to the given decimal precision (1 or 2) and return a string.
// Falls back gracefully for invalid input.
export function formatNumber(value, precision = 1) {
  const n = Number(value);
  if (!isFinite(n)) {
    return '0';
  }
  const p = precision === 2 ? 2 : precision === 0 ? 0 : 1;
  // Round half away from zero, then trim trailing zeros for clean display.
  const factor = Math.pow(10, p);
  const rounded = Math.round((n + Number.EPSILON) * factor) / factor;
  // toFixed keeps a consistent look, but strip unnecessary trailing zeros.
  let str = rounded.toFixed(p);
  if (str.indexOf('.') !== -1) {
    str = str.replace(/0+$/, '').replace(/\.$/, '');
  }
  return str;
}

// Round a value UP to a whole number (used for tiles and rolls).
export function ceilWhole(value) {
  const n = Number(value);
  if (!isFinite(n) || n < 0) {
    return 0;
  }
  return Math.ceil(n);
}

// Format an ISO date string into a short readable date/time.
export function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) {
      return '';
    }
    const pad = (x) => (x < 10 ? '0' + x : String(x));
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (e) {
    return '';
  }
}

// Parse a user-entered string into a finite number, or null if invalid.
export function parseNumber(input) {
  if (input == null) {
    return null;
  }
  const trimmed = String(input).trim().replace(',', '.');
  if (trimmed === '') {
    return null;
  }
  const n = Number(trimmed);
  if (!isFinite(n)) {
    return null;
  }
  return n;
}
