/**
 * AtlasIQ Data Formatting Utilities
 * Enforces single-unit presentation, safe numeric parsing, and legitimate zero preservation.
 */

export function cleanUnit(unit?: string): string {
  if (!unit) return '';
  return unit.trim();
}

/**
 * Strips duplicate unit occurrences from a value string if already present.
 * Prevents bugs like "49.93 m³/s m³/s".
 */
export function stripUnitFromValue(val: string | number | null | undefined, unit?: string): string {
  if (val === null || val === undefined) return '—';
  const str = String(val).trim();
  if (!str || str === '—' || str === 'Unavailable' || str === 'Pending' || str === 'Integration Pending') {
    return str;
  }

  if (!unit) return str;
  const u = unit.trim();

  // If the value string ends with the unit, remove it
  if (str.toLowerCase().endsWith(` ${u.toLowerCase()}`)) {
    return str.slice(0, -(u.length + 1)).trim();
  }
  if (str.toLowerCase().endsWith(u.toLowerCase())) {
    return str.slice(0, -u.length).trim();
  }

  // Currency special handling
  if (u.toUpperCase() === 'USD' && str.startsWith('$')) {
    return str.replace(/^\$\s*/, '').trim();
  }

  return str;
}

/**
 * Formats a metric value with its unit supplied exactly once.
 * Handles legitimate zeros (e.g. 0 °C, 0 events, 0 mm rain) without treating them as missing data.
 */
export function formatDisplayValueWithUnit(
  val: string | number | null | undefined,
  unit?: string
): string {
  if (val === null || val === undefined) return 'Unavailable';
  const str = String(val).trim();
  if (
    !str ||
    str === '—' ||
    str.toLowerCase() === 'unavailable' ||
    str.toLowerCase() === 'pending' ||
    str.toLowerCase() === 'integration pending'
  ) {
    return 'Unavailable';
  }

  const u = cleanUnit(unit);
  const cleanVal = stripUnitFromValue(str, u);

  if (!u) return cleanVal;

  if (u.toUpperCase() === 'USD') {
    // If it already has $, don't duplicate
    return cleanVal.startsWith('$') ? cleanVal : `$${cleanVal}`;
  }
  if (u === '%') {
    return cleanVal.endsWith('%') ? cleanVal : `${cleanVal}%`;
  }
  if (u === '°C') {
    return cleanVal.endsWith('°C') ? cleanVal : `${cleanVal} °C`;
  }

  return `${cleanVal} ${u}`;
}

/**
 * Validates whether a value represents legitimate numeric observation (including zero)
 */
export function isValidNumeric(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'number') {
    return !Number.isNaN(val) && Number.isFinite(val);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed === '—' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'infinity') {
      return false;
    }
    const parsed = Number(trimmed);
    return !Number.isNaN(parsed) && Number.isFinite(parsed);
  }
  return false;
}
