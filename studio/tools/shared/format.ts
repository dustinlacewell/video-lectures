/* Pure: text formatting shared by reports. */

/** Seconds -> "m:ss.s". */
export function clock(t: number): string {
  const tenths = Math.round(Math.max(0, t) * 10), m = Math.floor(tenths / 600), s = (tenths % 600) / 10;
  return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1);
}

/** A number rounded for a report cell. */
export function num(x: number, digits = 2): string {
  return Number.isFinite(x) ? x.toFixed(digits) : '';
}

/** Safe file-name piece. */
export function slug(s: string): string {
  return s.replace(/[^A-Za-z0-9._-]+/g, '-');
}

/** Zero-padded position, e.g. 3 -> "03". */
export function pad2(n: number): string {
  return (n < 10 ? '0' : '') + n;
}
