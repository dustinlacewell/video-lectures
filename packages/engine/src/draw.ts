/* Canvas primitives: shapes, lines, arrows, marks. */

import { c } from './canvas';
import { H, TAU, W, rgba } from './math';

/** Fill the whole stage with a vertical gradient. */
export function bgGradient(top: string, bottom: string): void {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

export function rr(x: number, y: number, w: number, h: number, r: number): void {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
export function fillRR(x: number, y: number, w: number, h: number, r: number, col: string): void {
  rr(x, y, w, h, r); c.fillStyle = col; c.fill();
}
export function strokeRR(x: number, y: number, w: number, h: number, r: number, col: string, lw?: number, dash?: number[]): void {
  rr(x, y, w, h, r); c.strokeStyle = col; c.lineWidth = lw || 3; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
}
export function circ(x: number, y: number, r: number, col: string): void {
  c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); c.fillStyle = col; c.fill();
}
export function ring(x: number, y: number, r: number, col: string, lw?: number, dash?: number[]): void {
  c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); c.strokeStyle = col; c.lineWidth = lw || 3; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
}
export function ell(x: number, y: number, rx: number, ry: number, col: string, rot?: number): void {
  c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot || 0, 0, TAU); c.fillStyle = col; c.fill();
}
export function line(pts: number[], col: string, lw?: number, dash?: number[]): void {
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.strokeStyle = col; c.lineWidth = lw || 3; c.lineJoin = 'round'; c.lineCap = 'round'; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
}
export function poly(pts: number[], col: string): void {
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath(); c.fillStyle = col; c.fill();
}
export function glow(x: number, y: number, r: number, col: string, a?: number | null): void {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a == null ? 0.6 : a)); g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
}
export function arrow(x1: number, y1: number, x2: number, y2: number, col: string, lw?: number, head?: number): void {
  lw = lw || 4; head = head || lw * 3.2;
  const a = Math.atan2(y2 - y1, x2 - x1);
  line([x1, y1, x2 - Math.cos(a) * head * 0.6, y2 - Math.sin(a) * head * 0.6], col, lw);
  poly([x2, y2, x2 - head * Math.cos(a - 0.45), y2 - head * Math.sin(a - 0.45), x2 - head * Math.cos(a + 0.45), y2 - head * Math.sin(a + 0.45)], col);
}
export function check(x: number, y: number, s: number, col: string, lw?: number): void {
  line([x - s * 0.5, y, x - s * 0.12, y + s * 0.4, x + s * 0.55, y - s * 0.42], col, lw || s * 0.22);
}
export function cross(x: number, y: number, s: number, col: string, lw?: number): void {
  line([x - s, y - s, x + s, y + s], col, lw || s * 0.3);
  line([x + s, y - s, x - s, y + s], col, lw || s * 0.3);
}
