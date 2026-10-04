/* The AI: a hovering screen-faced robot. Feet at (x,y). */

import { A, c, tf } from '@studio/engine/canvas';
import { circ, ell, fillRR, glow, line, rr } from '@studio/engine/draw';
import { PI } from '@studio/engine/math';
import { C } from '@studio/engine/palette';

export function aibot(x: number, y: number, s: number, T: number, lift?: number): void {
  tf(x, y - (lift || 0), s, 0, function () {
    const h = Math.sin(T * 2 + 4) * 6, col = '#3FD0C9', bl = ((T + 2.2) % 3.9) < 0.12;
    A(0.22); ell(0, 4 + (lift || 0), 60 - h, 11, '#000'); A(1);
    glow(0, -30 + h, 80, C.cyan, 0.35);
    [-1, 1].forEach(function (sd) { for (let i = 0; i < 3; i++) fillRR(sd * 70 - 8, -158 + h + i * 30, 16, 14, 5, '#259C97'); });
    fillRR(-72, -196 + h, 144, 154, 36, col);
    c.save(); rr(-72, -196 + h, 144, 154, 36); c.clip(); c.fillStyle = 'rgba(21,15,51,0.13)'; c.fillRect(24, -200 + h, 60, 170); c.restore();
    fillRR(-54, -176 + h, 108, 88, 22, C.ink);
    if (bl) { line([-34, -138 + h, -14, -138 + h], C.cyan, 6); line([14, -138 + h, 34, -138 + h], C.cyan, 6); }
    else { fillRR(-34, -152 + h, 20, 26, 9, C.cyan); fillRR(14, -152 + h, 20, 26, 9, C.cyan); }
    c.beginPath(); c.arc(0, -118 + h, 11, 0.2 * PI, 0.8 * PI); c.strokeStyle = C.cyan; c.lineWidth = 4.5; c.lineCap = 'round'; c.stroke();
    circ(-30, -66 + h, 6, 'rgba(255,255,255,0.5)'); circ(-10, -66 + h, 6, C.yellow); circ(10, -66 + h, 6, C.pink);
  });
}
