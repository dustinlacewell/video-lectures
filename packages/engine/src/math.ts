/* Pure math: clamps, easings, interpolation, seeded random, colour strings. */

export const W = 1280;
export const H = 720;
export const PI = Math.PI;
export const TAU = PI * 2;

export function cl(x: number): number { return x < 0 ? 0 : x > 1 ? 1 : x; }
export function ease(x: number): number { x = cl(x); return x * x * (3 - 2 * x); }
export function easeOut(x: number): number { x = cl(x); return 1 - Math.pow(1 - x, 3); }
export function easeIn(x: number): number { x = cl(x); return x * x * x; }
export function back(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const s = 1.9;
  x -= 1;
  return x * x * ((s + 1) * x + s) + 1;
}
export function lerp(a: number, b: number, u: number): number { return a + (b - a) * u; }

/** Seeded LCG. Same sequence as the source. */
export function rng(seed: number): () => number {
  return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}

export function hex(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
export function rgba(h: string, a: number): string {
  const v = hex(h);
  return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a + ')';
}
export function mix(h1: string, h2: string, u: number): string {
  const a = hex(h1), b = hex(h2);
  return 'rgb(' + Math.round(lerp(a[0], b[0], u)) + ',' + Math.round(lerp(a[1], b[1], u)) + ',' + Math.round(lerp(a[2], b[2], u)) + ')';
}
