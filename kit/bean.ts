/* The cast: a rounded figure standing with its feet at (x,y). */

import { A, c, withA } from '../engine/canvas';
import { circ, ell, fillRR, line, rr } from '../engine/draw';
import { PI, cl } from '../engine/math';
import { C, DK } from '../engine/palette';

export type Mouth = 'smile' | 'frown' | 'flat' | 'o' | 'talk' | 'yell' | 'grin';

export interface BeanOpts {
  x: number; y: number; s?: number; color?: string; t?: number;
  look?: number[]; mouth?: Mouth;
  /** Arm angle: 0 hangs, PI points up. */
  armL?: number; armR?: number;
  /** World point the hand reaches to. Overrides the arm angle. */
  reachL?: number[]; reachR?: number[];
  squash?: number; lift?: number; tilt?: number; blank?: boolean; closed?: boolean;
  brow?: number; alpha?: number | null; phase?: number; still?: boolean;
}

export function bean(o: BeanOpts): void {
  const s = o.s || 1, t = o.t || 0, col = o.color || C.orange, ph = o.phase || 0;
  const bob = o.still ? 0 : Math.sin(t * 2.1 + ph) * 2.5, sq = o.squash || 0, look = o.look || [0, 0], lift = o.lift || 0;
  withA(o.alpha == null ? 1 : o.alpha, function () {
    c.save(); c.translate(o.x, o.y); c.scale(s, s);
    A(0.25 * (1 - cl(lift / 160) * 0.6)); ell(0, 4, 72 - Math.min(30, lift * 0.2), 13, '#000'); A(1);
    c.translate(0, -lift); if (o.tilt) c.rotate(o.tilt);
    c.scale(1 + sq * 0.14, 1 - sq * 0.14);
    body(col, bob);
    arms(o, s, col, bob, lift);
    const ey = -130 + bob;
    eyes(o, t, ph, look, ey);
    brows(o.brow, ey);
    mouth(o.mouth || 'smile', -94 + bob, t, ph);
    c.restore();
  });
}

function body(col: string, bob: number): void {
  fillRR(-48, -16, 38, 20, 10, col); fillRR(-48, -16, 38, 20, 10, DK);
  fillRR(10, -16, 38, 20, 10, col); fillRR(10, -16, 38, 20, 10, DK);
  rr(-60, -182 + bob, 120, 174, 58); c.fillStyle = col; c.fill();
  c.save(); rr(-60, -182 + bob, 120, 174, 58); c.clip();
  c.fillStyle = 'rgba(21,15,51,0.14)'; c.fillRect(18, -200, 60, 220);
  ell(-24, -156 + bob, 24, 13, 'rgba(255,255,255,0.13)', -0.5);
  c.restore();
}

function arms(o: BeanOpts, s: number, col: string, bob: number, lift: number): void {
  ([[-1, o.armL, o.reachL], [1, o.armR, o.reachR]] as [number, number | undefined, number[] | undefined][]).forEach(function (q) {
    const side = q[0], ang = q[1] == null ? 0.14 : q[1], sx = side * 54, sy = -108 + bob;
    let hx: number, hy: number;
    if (q[2]) { hx = (q[2][0] - o.x) / s; hy = (q[2][1] - o.y) / s + lift; }
    else { hx = sx + side * Math.sin(ang) * 62; hy = sy + Math.cos(ang) * 62; }
    line([sx, sy, hx, hy], col, 20); line([sx, sy, hx, hy], DK, 20); circ(hx, hy, 12.5, col);
  });
}

function eyes(o: BeanOpts, t: number, ph: number, look: number[], ey: number): void {
  const bl = !o.blank && ((t + ph * 1.7) % 4.3) < 0.13;
  [-24, 24].forEach(function (ex) {
    if (o.blank) { circ(ex, ey, 17, 'rgba(255,255,255,0.55)'); return; }
    if (bl || o.closed) { line([ex - 14, ey, ex + 14, ey], C.ink, 5); return; }
    circ(ex, ey, 17, C.white); circ(ex + look[0] * 7, ey + look[1] * 5, 8.5, C.ink); circ(ex + look[0] * 7 + 3, ey + look[1] * 5 - 3, 2.6, C.white);
  });
}

function brows(brow: number | undefined, ey: number): void {
  if (brow! > 0) { line([-40, ey - 28, -12, ey - 19], C.ink, 6); line([40, ey - 28, 12, ey - 19], C.ink, 6); }
  if (brow! < 0) { line([-40, ey - 20, -14, ey - 28], C.ink, 5); line([40, ey - 20, 14, ey - 28], C.ink, 5); }
}

function mouth(m: Mouth, my: number, t: number, ph: number): void {
  c.strokeStyle = C.ink; c.lineWidth = 5; c.lineCap = 'round';
  if (m === 'smile') { c.beginPath(); c.arc(0, my - 8, 17, 0.18 * PI, 0.82 * PI); c.stroke(); }
  else if (m === 'frown') { c.beginPath(); c.arc(0, my + 16, 15, 1.2 * PI, 1.8 * PI); c.stroke(); }
  else if (m === 'flat') line([-12, my, 12, my], C.ink, 5);
  else if (m === 'o') ell(0, my + 2, 9, 11, C.ink);
  else if (m === 'talk') ell(0, my + 2, 12, 4 + 9 * Math.abs(Math.sin(t * 9 + ph)), C.ink);
  else if (m === 'yell') { fillRR(-18, my - 14, 36, 34, 13, C.ink); ell(0, my + 12, 10, 6, C.pink); }
  else if (m === 'grin') { c.beginPath(); c.arc(0, my - 6, 19, 0, PI); c.closePath(); c.fillStyle = C.ink; c.fill(); fillRR(-13, my - 6, 26, 6, 2, C.white); }
}
