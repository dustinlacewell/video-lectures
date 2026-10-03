/* Text: font setting, measuring, wrapping, pill labels, speech bubbles. */

import { c } from './canvas';
import { fillRR, poly } from './draw';
import { C, FONT } from './palette';

export function font(size: number, weight?: number): void { c.font = (weight || 600) + ' ' + size + 'px ' + FONT; }

export function txt(s: string, x: number, y: number, size: number, col: string, align?: CanvasTextAlign, weight?: number): void {
  font(size, weight); c.fillStyle = col; c.textAlign = align || 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y);
}

export function tw(s: string, size: number, weight?: number): number { font(size, weight); return c.measureText(s).width; }

let wrapCache: Record<string, string[]> = {};

/** Forget measured wraps. Call after web fonts arrive. */
export function clearWrapCache(): void { wrapCache = {}; }

export function wrap(s: string, size: number, weight: number, maxW: number): string[] {
  const key = s + '|' + size + '|' + weight + '|' + maxW;
  if (wrapCache[key]) return wrapCache[key];
  font(size, weight);
  const words = s.split(' '), lines: string[] = [];
  let cur = '';
  words.forEach(function (w) {
    const t = cur ? cur + ' ' + w : w;
    if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  });
  if (cur) lines.push(cur);
  wrapCache[key] = lines;
  return lines;
}

/** Pill label centred on (x,y). Returns its width. */
export function tag(s: string, x: number, y: number, size: number, bg: string, fg: string, weight?: number): number {
  const w = tw(s, size, weight || 600) + size * 1.1, h = size * 1.7;
  fillRR(x - w / 2, y - h / 2, w, h, h / 2, bg); txt(s, x, y + size * 0.04, size, fg, 'center', weight || 600);
  return w;
}

export interface BubbleOpts {
  maxW?: number; dx?: number; bg?: string; fg?: string; scale?: number | null; tail?: number;
}

/** Speech bubble whose tail tip is at (x,y); grows upward. */
export function bubble(s: string, x: number, y: number, size: number, o?: BubbleOpts): void {
  o = o || {};
  const lines = wrap(s, size, 600, o.maxW || 360), lh = size * 1.22;
  let wMax = 0;
  lines.forEach(function (l) { wMax = Math.max(wMax, tw(l, size, 600)); });
  const w = wMax + size * 1.5, h = lines.length * lh + size * 1.0, bx = x - w / 2 + (o.dx || 0), by = y - 22 - h;
  const bg = o.bg || C.white, fg = o.fg || C.ink;
  c.save(); c.translate(x, y); const sc = o.scale == null ? 1 : o.scale; c.scale(sc, sc); c.translate(-x, -y);
  poly([x - 14, by + h - 2, x + 14, by + h - 2, x + (o.tail || 0), y], bg);
  fillRR(bx, by, w, h, Math.min(26, h / 2), bg);
  lines.forEach(function (l, i) { txt(l, bx + w / 2, by + size * 0.5 + lh * (i + 0.5), size, fg, 'center', 600); });
  c.restore();
}
