/* Keep boxes inside the frame. The core is pure 1-D span fitting; the shell reads the canvas transform
   so the fit happens in screen space, whatever the camera is doing. */

import { c } from './canvas';
import { W } from './math';

/** Virtual pixels kept clear at each frame edge. */
export const SAFE_MARGIN = 16;

/** A span [lo, hi] to move inside [min, max]. After the shift it must still cover `need`. */
export interface SpanFit { lo: number; hi: number; min: number; max: number; need?: [number, number] }

/** Pure: the shift that moves [lo, hi] inside [min, max]. A too-wide span centres. `need` wins over the frame. */
export function fitShift(f: SpanFit): number {
  const w = f.hi - f.lo, room = f.max - f.min;
  let d = w > room ? (f.min + f.max) / 2 - (f.lo + f.hi) / 2 : Math.min(Math.max(0, f.min - f.lo), f.max - f.hi);
  if (f.need) d = Math.min(Math.max(d, f.need[1] - f.hi), f.need[0] - f.lo);
  return d;
}

/** Pure: how much of a wanted shift `d` a label takes. Small overshoots are taken whole; larger ones
    give way, continuously, so a label leaving the frame with its object slides out after it.
    A label that was wholly outside the frame (|d| >= size + pad) gets no shift, so it never peeks in. */
export function labelGive(d: number, size: number, pad: number): number {
  const L = (size + pad) / 2, o = Math.abs(d);
  return Math.sign(d) * (o <= L ? o : Math.max(0, 2 * L - o));
}

export interface Box { x: number; y: number; w: number; h: number }

/** Spans the shifted box must still cover, per axis, in local units. Omitted axes are free. */
export interface Keep { x?: [number, number]; y?: [number, number] }

/** Local-space shift that moves `box` inside the safe area of the frame. No shift under rotation or skew. */
export function onScreenShift(box: Box, keep: Keep): [number, number] {
  const f = frame(box, keep);
  return f ? [fitShift(f.x) / f.sx, fitShift(f.y) / f.sy] : [0, 0];
}

/** Local-space shift for a label: as onScreenShift, but giving way when the label is far outside. */
export function labelShift(box: Box): [number, number] {
  const f = frame(box, {});
  if (!f) return [0, 0];
  return [labelGive(fitShift(f.x), f.x.hi - f.x.lo, f.pad) / f.sx, labelGive(fitShift(f.y), f.y.hi - f.y.lo, f.pad) / f.sy];
}

/** The box's two axes in screen pixels, with the safe area, or null if the transform rotates or skews. */
function frame(box: Box, keep: Keep): { x: SpanFit; y: SpanFit; sx: number; sy: number; pad: number } | null {
  const m = c.getTransform(), pad = SAFE_MARGIN * c.canvas.width / W;
  if (m.b !== 0 || m.c !== 0 || m.a === 0 || m.d === 0) return null;
  return {
    x: axis(box.x, box.x + box.w, keep.x, m.a, m.e, pad, c.canvas.width - pad),
    y: axis(box.y, box.y + box.h, keep.y, m.d, m.f, pad, c.canvas.height - pad),
    sx: m.a, sy: m.d, pad: pad
  };
}

/** One axis mapped to screen; a negative scale swaps the ends. */
function axis(lo: number, hi: number, need: [number, number] | undefined, s: number, o: number, min: number, max: number): SpanFit {
  const map = function (p: number, q: number): [number, number] { const a = p * s + o, b = q * s + o; return a < b ? [a, b] : [b, a]; };
  const b = map(lo, hi);
  return { lo: b[0], hi: b[1], min: min, max: max, need: need && map(need[0], need[1]) };
}
