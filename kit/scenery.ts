/* Scenery: star fields, soft floating blobs, ground strips, and motion along paths. */

import type { Cam } from '../script/types';
import { c } from '../engine/canvas';
import { circ } from '../engine/draw';
import { cl, lerp, rng } from '../engine/math';
import { C } from '../engine/palette';
import { withCam } from '../engine/parallax';

export function stars(cam: Cam, T: number, seed: number, n: number, f: number, col?: string): void {
  withCam(cam, f, function () {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = -500 + r() * 3600, y = -200 + r() * 1000, s = 1 + r() * 2.6, tw2 = 0.55 + 0.45 * Math.sin(T * (1 + r() * 2) + i);
      c.globalAlpha = 0.25 + 0.6 * tw2 * r(); circ(x, y, s, col || C.white);
    }
    c.globalAlpha = 1;
  });
}

export function floaters(cam: Cam, T: number, seed: number, n: number, cols: string[], f: number): void {
  withCam(cam, f, function () {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = -500 + r() * 3600 + Math.sin(T * 0.2 + i) * 30, y = -150 + r() * 900 + Math.cos(T * 0.17 + i * 2) * 24, s = 24 + r() * 90;
      c.globalAlpha = 0.05 + r() * 0.07; circ(x, y, s, cols[i % cols.length]);
    }
    c.globalAlpha = 1;
  });
}

export function ground(y: number, x0: number, x1: number, top: string, body: string): void {
  c.fillStyle = body; c.fillRect(x0, y, x1 - x0, 900);
  c.fillStyle = top; c.fillRect(x0, y, x1 - x0, 14);
}

type Seg = [number, number, number, number, number];

function segments(pts: number[]): { segs: Seg[]; total: number } {
  const segs: Seg[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 2; i += 2) {
    const d = Math.hypot(pts[i + 2] - pts[i], pts[i + 3] - pts[i + 1]);
    segs.push([pts[i], pts[i + 1], pts[i + 2], pts[i + 3], d]); total += d;
  }
  return { segs: segs, total: total };
}

/** Dots travelling along a polyline: current in wires, signals in nerves. */
export function flow(pts: number[], T: number, speed: number, gap: number, r: number, col: string): void {
  const { segs, total } = segments(pts);
  for (let p = (T * speed) % gap; p < total; p += gap) {
    let q = p;
    for (let i = 0; i < segs.length; i++) {
      if (q <= segs[i][4]) { circ(lerp(segs[i][0], segs[i][2], q / segs[i][4]), lerp(segs[i][1], segs[i][3], q / segs[i][4]), r, col); break; }
      q -= segs[i][4];
    }
  }
}

/** The point a fraction u of the way along a polyline. */
export function along(pts: number[], u: number): number[] {
  const { segs, total } = segments(pts);
  let q = cl(u) * total;
  for (let i = 0; i < segs.length; i++) {
    if (q <= segs[i][4] || i === segs.length - 1) {
      const v = segs[i][4] ? cl(q / segs[i][4]) : 0;
      return [lerp(segs[i][0], segs[i][2], v), lerp(segs[i][1], segs[i][3], v)];
    }
    q -= segs[i][4];
  }
  return [];
}
