/* Animals: crow, dog, octopus. Feet at (x,y); `lift` raises them off the ground. */

import { A, c, tf } from '../engine/canvas';
import { circ, ell, fillRR, line, poly } from '../engine/draw';
import { PI, TAU } from '../engine/math';
import { C } from '../engine/palette';

export type Creature = (x: number, y: number, s: number, T: number, lift?: number) => void;

export function crow(x: number, y: number, s: number, T: number, lift?: number): void {
  tf(x, y - (lift || 0), s, 0, function () {
    const b = Math.sin(T * 2.3 + 1) * 2;
    A(0.25); ell(0, 4 + (lift || 0), 66, 12, '#000'); A(1);
    line([-16, -6, -16, -46], '#F2B544', 6); line([14, -6, 14, -46], '#F2B544', 6);
    line([-28, -4, -4, -4], '#F2B544', 6); line([2, -4, 26, -4], '#F2B544', 6);
    poly([-52, -72 + b, -130, -50 + b, -122, -80 + b, -60, -104 + b], '#171433');
    ell(-6, -86 + b, 68, 50, '#2C2658', -0.25);
    ell(-20, -82 + b, 46, 28, '#171433', -0.35);
    circ(46, -140 + b, 35, '#2C2658');
    poly([72, -152 + b, 120, -136 + b, 74, -124 + b], '#F2B544'); poly([74, -138 + b, 120, -136 + b, 74, -124 + b], 'rgba(21,15,51,0.2)');
    circ(54, -146 + b, 10, C.white); circ(57, -146 + b, 5, C.ink);
    line([98, -134 + b, 156, -92 + b], '#C98A4B', 6); line([156, -92 + b, 162, -104 + b], '#C98A4B', 5);
  });
}

export function dog(x: number, y: number, s: number, T: number, lift?: number): void {
  tf(x, y - (lift || 0), s, 0, function () {
    const b = Math.sin(T * 2.2 + 2) * 2, wag = Math.sin(T * 10) * 0.5, col = '#EDA75F', dk = '#A8652E';
    A(0.25); ell(0, 4 + (lift || 0), 70, 12, '#000'); A(1);
    line([54, -36, 54 + Math.cos(-1 + wag) * 52, -36 + Math.sin(-1 + wag) * 52], dk, 14);
    fillRR(-58, -124 + b, 116, 124, 52, col); ell(0, -46 + b, 34, 40, '#FFE2C0');
    fillRR(-44, -18, 34, 22, 11, col); fillRR(10, -18, 34, 22, 11, col); fillRR(-44, -18, 34, 22, 11, 'rgba(21,15,51,0.12)'); fillRR(10, -18, 34, 22, 11, 'rgba(21,15,51,0.12)');
    ell(-54, -150 + b, 20, 42, dk, 0.35); ell(54, -150 + b, 20, 42, dk, -0.35);
    circ(0, -158 + b, 54, col);
    ell(0, -140 + b, 28, 21, '#FFE2C0'); ell(0, -150 + b, 10, 7, C.ink);
    c.beginPath(); c.arc(0, -140 + b, 11, 0.15 * PI, 0.85 * PI); c.strokeStyle = C.ink; c.lineWidth = 4; c.lineCap = 'round'; c.stroke();
    circ(-21, -172 + b, 12, C.white); circ(21, -172 + b, 12, C.white); circ(-19, -171 + b, 6, C.ink); circ(23, -171 + b, 6, C.ink);
  });
}

export function octopus(x: number, y: number, s: number, T: number, lift?: number): void {
  tf(x, y - (lift || 0), s, 0, function () {
    const b = Math.sin(T * 2 + 3) * 3, col = '#D56BE0', dk = '#A548B8';
    A(0.25); ell(0, 4 + (lift || 0), 92, 13, '#000'); A(1);
    for (let i = 0; i < 6; i++) {
      const x0 = -45 + i * 18, dir = i < 3 ? -1 : 1, sw = Math.sin(T * 2.4 + i * 1.3) * 12, ex = x0 + dir * (34 + (i % 3 === (dir < 0 ? 0 : 2) ? 34 : 10)) + sw;
      c.beginPath(); c.moveTo(x0, -70 + b); c.quadraticCurveTo(x0 + dir * 6, -30, ex, -8); c.quadraticCurveTo(ex + dir * 16, 0, ex + dir * 14, -16);
      c.strokeStyle = i % 2 ? dk : col; c.lineWidth = 17; c.lineCap = 'round'; c.stroke();
    }
    ell(0, -124 + b, 68, 76, col);
    c.save(); c.beginPath(); c.ellipse(0, -124 + b, 68, 76, 0, 0, TAU); c.clip(); circ(40, -100 + b, 70, 'rgba(21,15,51,0.13)'); c.restore();
    circ(-30, -168 + b, 8, 'rgba(255,255,255,0.25)'); circ(-12, -182 + b, 5, 'rgba(255,255,255,0.25)');
    circ(-24, -112 + b, 15, C.white); circ(24, -112 + b, 15, C.white); circ(-22, -110 + b, 7.5, C.ink); circ(26, -110 + b, 7.5, C.ink);
    c.beginPath(); c.arc(0, -92 + b, 12, 0.2 * PI, 0.8 * PI); c.strokeStyle = C.ink; c.lineWidth = 4.5; c.lineCap = 'round'; c.stroke();
  });
}
