/* Icons drawn in a 100-unit box, and round badges that hold them. */

import { c, tf } from '@studio/engine/canvas';
import { circ, ell, fillRR, line, poly, ring } from '@studio/engine/draw';
import { PI, TAU, mix, rgba } from '@studio/engine/math';
import { C } from '@studio/engine/palette';
import { txt } from '@studio/engine/text';

export type IconKind =
  | 'memory' | 'habit' | 'belief' | 'talent' | 'love' | 'fear' | 'humor' | 'plan' | 'eye' | 'tool'
  | 'puzzle' | 'language' | 'self' | 'cup' | 'book' | 'clock';

const w = C.white, k = C.ink;

const ICONS: Record<IconKind, (col: string) => void> = {
  memory: function (col) { fillRR(-24, -29, 48, 58, 5, w); fillRR(-18, -23, 36, 32, 3, mix(col, C.ink, 0.55)); circ(8, -13, 6, C.yellow); poly([-18, 9, -4, -6, 6, 4, 12, -2, 18, 9], rgba(C.white, 0.75)); },
  habit: function () { c.beginPath(); c.arc(0, 0, 21, 0.9, 5.6); c.strokeStyle = w; c.lineWidth = 9; c.stroke(); poly([14, -25, 31, -9, 9, -5], w); },
  belief: function () { line([-15, 28, -15, -28], w, 7); poly([-15, -29, 25, -16, -15, -3], w); },
  talent: function () { line([10, -26, 10, 14], w, 7); ell(0, 16, 12, 9, w, -0.3); line([10, -26, 26, -19], w, 8); },
  love: function () { c.beginPath(); c.moveTo(0, 26); c.bezierCurveTo(-40, 0, -24, -32, 0, -10); c.bezierCurveTo(24, -32, 40, 0, 0, 26); c.fillStyle = w; c.fill(); },
  fear: function () { poly([8, -31, -19, 5, -3, 5, -9, 31, 19, -7, 3, -7], w); },
  humor: function () {
    c.strokeStyle = w; c.lineWidth = 6;
    c.beginPath(); c.arc(-13, -8, 8, 1.1 * PI, 1.9 * PI); c.stroke(); c.beginPath(); c.arc(13, -8, 8, 1.1 * PI, 1.9 * PI); c.stroke();
    c.beginPath(); c.arc(0, 3, 20, 0, PI); c.closePath(); c.fillStyle = w; c.fill();
  },
  plan: function () { [-18, 0, 18].forEach(function (y, i) { fillRR(-26, y - 7, 14, 14, 3, w); line([-4, y, 24 - i * 6, y], w, 6); }); },
  eye: function () { c.beginPath(); c.moveTo(-30, 0); c.quadraticCurveTo(0, -30, 30, 0); c.quadraticCurveTo(0, 30, -30, 0); c.fillStyle = w; c.fill(); circ(0, 0, 11, k); circ(4, -4, 3.5, w); },
  tool: function () { line([-24, 24, 16, -16], w, 8); line([16, -16, 26, -22], w, 8); line([26, -22, 22, -8], w, 6); },
  puzzle: function (col) { fillRR(-22, -10, 44, 36, 6, w); circ(0, -13, 11, w); circ(22, 8, 9, col); },
  language: function () { fillRR(-27, -24, 54, 38, 12, w); poly([-12, 12, 2, 12, -14, 28], w); line([-15, -11, 15, -11], k, 4); line([-15, 1, 7, 1], k, 4); },
  self: function () {
    c.beginPath(); c.ellipse(0, -6, 21, 26, 0, 0, TAU); c.fillStyle = rgba(C.white, 0.3); c.fill(); c.strokeStyle = w; c.lineWidth = 6; c.stroke();
    line([0, 20, 0, 34], w, 8); line([-8, -14, 2, -22], w, 4);
  },
  cup: function () { fillRR(-20, -8, 34, 30, 8, w); ring(18, 6, 9, w, 5); line([-10, -18, -10, -26], w, 4); line([2, -18, 2, -28], w, 4); },
  book: function () { poly([-28, -18, -2, -12, -2, 22, -28, 16], w); poly([28, -18, 2, -12, 2, 22, 28, 16], rgba(C.white, 0.75)); },
  clock: function () { ring(0, 0, 23, w, 7); line([0, 0, 0, -14], w, 5); line([0, 0, 10, 6], w, 5); }
};

export function icon(kind: IconKind, col: string): void {
  c.lineCap = 'round'; c.lineJoin = 'round';
  ICONS[kind](col);
}

export interface BadgeOpts { scale?: number | null; rot?: number; label?: string; ls?: number; lc?: string }

export function badge(kind: IconKind, x: number, y: number, r: number, col: string, o?: BadgeOpts): void {
  const op = o || {};
  const sc = op.scale == null ? 1 : op.scale;
  if (sc <= 0.01) return;
  tf(x, y, sc, op.rot || 0, function () {
    circ(0, 5, r, 'rgba(0,0,0,0.25)'); circ(0, 0, r, col); ring(0, 0, r - 5, 'rgba(255,255,255,0.3)', 3);
    c.save(); c.scale(r / 54, r / 54); icon(kind, col); c.restore();
    if (op.label) txt(op.label, 0, r + (op.ls || 28) * 0.9, op.ls || 28, op.lc || C.cream, 'center', 600);
  });
}
