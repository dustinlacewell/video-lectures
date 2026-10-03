/* The marker for inner experience: lit = present, unlit = absent. */

import { c } from '../engine/canvas';
import { glow } from '../engine/draw';
import { PI } from '../engine/math';
import { C } from '../engine/palette';

function starPath(x: number, y: number, R: number, r2: number, rot: number): void {
  c.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (rot || 0) + i * PI / 4 - PI / 2, r = i % 2 ? r2 : R;
    if (i) c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); else c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  c.closePath();
}

export function spark(x: number, y: number, R: number, lit: boolean, t: number): void {
  if (lit) {
    glow(x, y, R * 3.4, C.yellow, 0.4 + 0.14 * Math.sin(t * 3));
    starPath(x, y, R * (1 + 0.06 * Math.sin(t * 5)), R * 0.42, 0); c.fillStyle = C.yellow; c.fill();
    starPath(x, y, R * 0.5, R * 0.2, 0); c.fillStyle = C.white; c.fill();
  } else {
    starPath(x, y, R, R * 0.42, 0); c.strokeStyle = C.grey; c.lineWidth = 3.5; c.setLineDash([7, 6]); c.stroke(); c.setLineDash([]);
  }
}
