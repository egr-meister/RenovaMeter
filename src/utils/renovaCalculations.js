// Renovation calculation helpers.
// Every function validates input, never returns NaN, and never crashes on
// empty input. Each returns either:
//   { ok: true, value: number, text: string }
// or
//   { ok: false, error: string }

import { parseNumber, formatNumber, ceilWhole } from './formatters';

const INVALID = 'Please enter valid numbers.';
const POSITIVE = 'Values must be greater than zero.';

// Validate a list of inputs: each must parse to a finite, positive number.
function parsePositive(values) {
  const out = [];
  for (let i = 0; i < values.length; i++) {
    const n = parseNumber(values[i]);
    if (n === null) {
      return { ok: false, error: INVALID };
    }
    if (n <= 0) {
      return { ok: false, error: POSITIVE };
    }
    out.push(n);
  }
  return { ok: true, values: out };
}

// 3.1 Floor area = length x width
export function calculateFloorArea(length, width, precision = 1) {
  const parsed = parsePositive([length, width]);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const [l, w] = parsed.values;
  const value = l * w;
  return {
    ok: true,
    value,
    text: `Floor area: ${formatNumber(value, precision)} m²`,
  };
}

// 3.2 Wall area = width x height
export function calculateWallArea(width, height, precision = 1) {
  const parsed = parsePositive([width, height]);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const [w, h] = parsed.values;
  const value = w * h;
  return {
    ok: true,
    value,
    text: `Wall area: ${formatNumber(value, precision)} m²`,
  };
}

// 3.3 Paint liters = wall area x coats / coverage
export function calculatePaintLiters(area, coverage, coats, precision = 1) {
  const parsed = parsePositive([area, coverage, coats]);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const [a, cov, coatsN] = parsed.values;
  const value = (a * coatsN) / cov;
  if (!isFinite(value)) {
    return { ok: false, error: INVALID };
  }
  // Round up to 1 decimal place.
  const rounded = Math.ceil(value * 10) / 10;
  return {
    ok: true,
    value: rounded,
    text: `Paint needed: ${formatNumber(rounded, Math.max(precision, 1))} liters`,
  };
}

// 3.4 Tiles needed (rounded up to a whole number, with waste)
export function calculateTilesNeeded(
  surfaceArea,
  tileLengthCm,
  tileWidthCm,
  wastePercent
) {
  const parsed = parsePositive([surfaceArea, tileLengthCm, tileWidthCm]);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  // Waste percent may be zero, so validate it separately.
  const waste = parseNumber(wastePercent);
  if (waste === null || waste < 0) {
    return { ok: false, error: INVALID };
  }
  const [surface, lenCm, widCm] = parsed.values;
  const tileAreaM2 = (lenCm * widCm) / 10000;
  if (tileAreaM2 <= 0) {
    return { ok: false, error: POSITIVE };
  }
  const tilesNeeded = surface / tileAreaM2;
  const tilesWithWaste = tilesNeeded * (1 + waste / 100);
  if (!isFinite(tilesWithWaste)) {
    return { ok: false, error: INVALID };
  }
  const value = ceilWhole(tilesWithWaste);
  return {
    ok: true,
    value,
    text: `Tiles needed: ${value} tiles`,
  };
}

// 3.5 Wallpaper rolls (rounded up to a whole number)
export function calculateWallpaperRolls(
  wallWidth,
  wallHeight,
  rollWidth,
  rollLength
) {
  const parsed = parsePositive([wallWidth, wallHeight, rollWidth, rollLength]);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const [ww, wh, rw, rl] = parsed.values;
  const wallArea = ww * wh;
  const rollArea = rw * rl;
  if (rollArea <= 0) {
    return { ok: false, error: POSITIVE };
  }
  const rolls = wallArea / rollArea;
  if (!isFinite(rolls)) {
    return { ok: false, error: INVALID };
  }
  const value = ceilWhole(rolls);
  return {
    ok: true,
    value,
    text: `Wallpaper rolls needed: ${value} rolls`,
  };
}
