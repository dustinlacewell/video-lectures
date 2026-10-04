/* The one drawing context, and the alpha stack every primitive respects.
   `c` and `GA` are live module bindings: importers always see the current value. */

import { cl } from './math';

export let c: CanvasRenderingContext2D;
export let GA = 1;

export function setContext(ctx: CanvasRenderingContext2D): void { c = ctx; }

/** Reset the alpha stack to fully opaque. */
export function resetAlpha(): void { GA = 1; c.globalAlpha = 1; }

/** Set alpha relative to the current stack level. */
export function A(a: number): void { c.globalAlpha = GA * cl(a); }

/** Run fn with the alpha stack multiplied by a. Skips fn when nearly invisible. */
export function withA(a: number, fn: () => void): void {
  const g = GA;
  GA = g * cl(a); c.globalAlpha = GA;
  if (GA > 0.003) fn();
  GA = g; c.globalAlpha = GA;
}

/** Translate, rotate, scale, then draw. */
export function tf(x: number, y: number, s: number, rot: number, fn: () => void): void {
  c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (s !== 1) c.scale(s, s); fn(); c.restore();
}
