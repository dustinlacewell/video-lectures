/* Pure: where a drawn box sits relative to the frame and its safe margin. */

/** A drawn box in canvas pixels, as the instrumentation records it. */
export interface DrawnBox { kind: 'text' | 'image'; text: string; x0: number; y0: number; x1: number; y1: number }

/** Frame size and safe margin, in canvas pixels. */
export interface FrameSpec { w: number; h: number; margin: number }

/** inside: clear of the margin. margin: in the frame but inside the safe margin. clipped: cut by the frame edge.
    outside: wholly off screen (not visible, not a defect). backdrop: an image as big as the frame. */
export type Verdict = 'inside' | 'margin' | 'clipped' | 'outside' | 'backdrop';

export type Edge = 'left' | 'right' | 'top' | 'bottom';

/** Anti-aliasing slack in pixels. */
const EPS = 0.5;

export function classify(b: DrawnBox, f: FrameSpec): Verdict {
  if (b.kind === 'image' && (b.x1 - b.x0 >= 0.9 * f.w || b.y1 - b.y0 >= 0.9 * f.h)) return 'backdrop';
  if (b.x1 <= EPS || b.y1 <= EPS || b.x0 >= f.w - EPS || b.y0 >= f.h - EPS) return 'outside';
  if (overflow(b, f, 0).depth > EPS) return 'clipped';
  if (overflow(b, f, f.margin).depth > EPS) return 'margin';
  return 'inside';
}

/** The edges the box crosses when the frame is shrunk by `inset`, and the deepest crossing in pixels. */
export function overflow(b: DrawnBox, f: FrameSpec, inset: number): { edges: Edge[]; depth: number } {
  const over: [Edge, number][] = [['left', inset - b.x0], ['top', inset - b.y0], ['right', b.x1 - (f.w - inset)], ['bottom', b.y1 - (f.h - inset)]];
  const hit = over.filter(function (o) { return o[1] > EPS; });
  return { edges: hit.map(function (o) { return o[0]; }), depth: hit.reduce(function (m, o) { return Math.max(m, o[1]); }, 0) };
}
