/* Text: font setting, measuring, wrapping, pill labels, speech bubbles.
   Every string may carry `*italic*` spans (see richText). Labels and bubbles stay inside the frame. */

import { c } from './canvas';
import { fillRR, poly } from './draw';
import { C, FONT } from './palette';
import { parseRuns, runsWidth, wrapMarkup, type Measure, type Run } from './richText';
import { labelShift, onScreenShift, type Box } from './safeArea';

export function font(size: number, weight?: number, italic?: boolean): void {
  c.font = (italic ? 'italic ' : '') + (weight || 600) + ' ' + size + 'px ' + FONT;
}

export function txt(s: string, x: number, y: number, size: number, col: string, align?: CanvasTextAlign, weight?: number): void {
  c.fillStyle = col; c.textBaseline = 'middle';
  const runs = parseRuns(s);
  if (isPlain(runs)) { font(size, weight); c.textAlign = align || 'center'; c.fillText(s, x, y); return; }
  drawRuns(runs, x, y, size, align || 'center', weight);
}

export function tw(s: string, size: number, weight?: number): number {
  const runs = parseRuns(s);
  if (isPlain(runs)) { font(size, weight); return c.measureText(s).width; }
  return runsWidth(runs, measurer(size, weight));
}

let wrapCache: Record<string, string[]> = {};

/** Forget measured wraps. Call after web fonts arrive. */
export function clearWrapCache(): void { wrapCache = {}; }

/** Lines of markup no wider than maxW. */
export function wrap(s: string, size: number, weight: number, maxW: number): string[] {
  const key = s + '|' + size + '|' + weight + '|' + maxW;
  if (!wrapCache[key]) wrapCache[key] = wrapMarkup(s, maxW, measurer(size, weight));
  return wrapCache[key];
}

/** Pill label centred on (x,y), nudged inside the frame when it pokes out. Returns the drawn box. */
export function tag(s: string, x: number, y: number, size: number, bg: string, fg: string, weight?: number): Box {
  const w = tw(s, size, weight || 600) + size * 1.1, h = size * 1.7, home = { x: x - w / 2, y: y - h / 2, w: w, h: h };
  const d = labelShift(home), box = { x: home.x + d[0], y: home.y + d[1], w: w, h: h };
  fillRR(box.x, box.y, w, h, h / 2, bg); txt(s, x + d[0], y + d[1] + size * 0.04, size, fg, 'center', weight || 600);
  return box;
}

export interface BubbleOpts {
  maxW?: number; dx?: number; bg?: string; fg?: string; scale?: number | null; tail?: number;
}

/** Tail base half-width; gap between tip and box; longest tail when the box has moved away from the tip. */
const TAIL_HALF = 14, TAIL_LEN = 22, TAIL_MAX = 64;

/** Speech bubble whose tail tip is at (x,y); grows upward; pops (scale) around the tip.
    The box slides fully inside the frame. When it slides, the tail moves along its bottom edge and
    still points at the speaker, even one standing off screen. */
export function bubble(s: string, x: number, y: number, size: number, o?: BubbleOpts): void {
  o = o || {};
  const lines = wrap(s, size, 600, o.maxW || 360), lh = size * 1.22, tail = o.tail || 0;
  let wMax = 0;
  lines.forEach(function (l) { wMax = Math.max(wMax, tw(l, size, 600)); });
  const w = wMax + size * 1.5, h = lines.length * lh + size * 1.0, r = Math.min(26, h / 2);
  const home = { x: x - w / 2 + (o.dx || 0), y: y - TAIL_LEN - h, w: w, h: h };
  const d = onScreenShift(home, { y: [home.y + 12, home.y + 12] }), bx = home.x + d[0], by = home.y + d[1];
  const base = Math.min(Math.max(x, bx + r + TAIL_HALF), bx + w - r - TAIL_HALF);
  const tip = toward(base, by + h, x + tail, y, TAIL_MAX);
  const bg = o.bg || C.white, fg = o.fg || C.ink, px = tip[0] - tail, py = tip[1];
  c.save(); c.translate(px, py); const sc = o.scale == null ? 1 : o.scale; c.scale(sc, sc); c.translate(-px, -py);
  poly([base - TAIL_HALF, by + h - 2, base + TAIL_HALF, by + h - 2, tip[0], tip[1]], bg);
  fillRR(bx, by, w, h, r, bg);
  lines.forEach(function (l, i) { txt(l, bx + w / 2, by + size * 0.5 + lh * (i + 0.5), size, fg, 'center', 600); });
  c.restore();
}

/** The point (tx,ty), pulled toward (x,y) so it is at most `max` away. */
function toward(x: number, y: number, tx: number, ty: number, max: number): [number, number] {
  const dx = tx - x, dy = ty - y, len = Math.hypot(dx, dy);
  return len <= max ? [tx, ty] : [x + dx / len * max, y + dy / len * max];
}

function isPlain(runs: Run[]): boolean { return runs.length <= 1 && !(runs[0] && runs[0].italic); }

function measurer(size: number, weight?: number): Measure {
  return function (text, italic) { font(size, weight, italic); return c.measureText(text).width; };
}

/** Draw style runs as one line, aligned as a single string would be. */
function drawRuns(runs: Run[], x: number, y: number, size: number, align: CanvasTextAlign, weight?: number): void {
  const total = runsWidth(runs, measurer(size, weight));
  let xx = align === 'center' ? x - total / 2 : align === 'right' || align === 'end' ? x - total : x;
  c.textAlign = 'left';
  runs.forEach(function (r) { font(size, weight, r.italic); c.fillText(r.text, xx, y); xx += c.measureText(r.text).width; });
}
