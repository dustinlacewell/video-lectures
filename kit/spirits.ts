/* Non-physical visitors: ghost, spirit, thought. Each floats around (x,y). */

import { c, tf, withA } from '../engine/canvas';
import { circ, ell, fillRR, glow, line } from '../engine/draw';
import { PI } from '../engine/math';
import { C } from '../engine/palette';

export interface SpiritOpts { t?: number; alpha?: number | null; rot?: number; flip?: boolean; mood?: string; shake?: number }

export type Visitor = (x: number, y: number, s: number, o?: SpiritOpts) => void;

export function ghost(x: number, y: number, s: number, o?: SpiritOpts): void {
  const op = o || {}, t = op.t || 0;
  withA(op.alpha == null ? 1 : op.alpha, function () {
    tf(x, y + Math.sin(t * 2.4) * 6, s, op.rot || 0, function () {
      if (op.flip) c.scale(-1, 1);
      glow(0, 0, 90, '#CFE4FF', 0.22);
      c.beginPath(); c.moveTo(-42, 48); c.lineTo(-42, -8); c.arc(0, -8, 42, PI, 0); c.lineTo(42, 48);
      c.quadraticCurveTo(35, 34, 28, 48); c.quadraticCurveTo(14, 60, 0, 46); c.quadraticCurveTo(-14, 60, -28, 48); c.quadraticCurveTo(-35, 34, -42, 48);
      c.fillStyle = 'rgba(232,242,255,0.92)'; c.fill();
      ell(-56, 10, 16, 9, 'rgba(232,242,255,0.92)', -0.5); ell(-50, -4, 10, 7, 'rgba(232,242,255,0.92)', -0.5);
      ell(-18, -14, 6, 9, C.ink); ell(8, -14, 6, 9, C.ink);
      if (op.mood === 'sad') { c.beginPath(); c.arc(-5, 20, 9, 1.15 * PI, 1.85 * PI); c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke(); }
      else ell(-5, 10, 6, 8, C.ink);
    });
  });
}

export function spirit(x: number, y: number, s: number, o?: SpiritOpts): void {
  const op = o || {}, t = op.t || 0;
  withA(op.alpha == null ? 1 : op.alpha, function () {
    tf(x, y + Math.sin(t * 2.8 + 1) * 6, s, op.rot || 0, function () {
      if (op.flip) c.scale(-1, 1);
      glow(0, 0, 100, C.cyan, 0.3);
      const w = Math.sin(t * 4) * 6;
      c.beginPath(); c.moveTo(w, -78); c.bezierCurveTo(56, -20, 46, 46, 0, 50); c.bezierCurveTo(-46, 46, -56, -20, w, -78);
      c.fillStyle = 'rgba(111,227,240,0.9)'; c.fill();
      c.beginPath(); c.moveTo(w * 0.6, -36); c.bezierCurveTo(28, -4, 24, 34, 0, 36); c.bezierCurveTo(-24, 34, -28, -4, w * 0.6, -36);
      c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.arc(-14, 2, 7, 1.1 * PI, 1.9 * PI); c.stroke(); c.beginPath(); c.arc(12, 2, 7, 1.1 * PI, 1.9 * PI); c.stroke();
      if (op.mood === 'sad') { c.beginPath(); c.arc(-1, 26, 7, 1.15 * PI, 1.85 * PI); c.stroke(); } else ell(-1, 18, 4, 5, C.ink);
      circ(18, 66, 9, 'rgba(111,227,240,0.6)'); circ(30, 84, 5, 'rgba(111,227,240,0.4)');
    });
  });
}

export function thought(x: number, y: number, s: number, o?: SpiritOpts): void {
  const op = o || {}, t = op.t || 0, sh = op.shake ? Math.sin(t * 60) * 3 * op.shake : 0;
  withA(op.alpha == null ? 1 : op.alpha, function () {
    tf(x + sh, y + Math.sin(t * 2.2 + 2) * 5, s, op.rot || 0, function () {
      if (op.flip) c.scale(-1, 1);
      const w = 'rgba(255,255,255,0.95)';
      circ(52, 52, 10, w); circ(68, 70, 6, w);
      circ(-34, 2, 30, w); circ(0, -16, 36, w); circ(36, 2, 30, w); circ(-14, 20, 28, w); circ(20, 22, 28, w);
      line([-30, -22, -10, -14], C.ink, 5); line([26, -22, 6, -14], C.ink, 5);
      circ(-18, -4, 5, C.ink); circ(14, -4, 5, C.ink);
      if (op.mood === 'sad') { c.beginPath(); c.arc(-2, 26, 9, 1.15 * PI, 1.85 * PI); c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke(); }
      else { fillRR(-14, 10, 26, 12, 4, C.ink); line([-6, 10, -6, 22], w, 2); line([-1, 10, -1, 22], w, 2); line([5, 10, 5, 22], w, 2); }
    });
  });
}
