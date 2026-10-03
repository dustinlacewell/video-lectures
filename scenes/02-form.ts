/* 2. Form is function: lever, pulley, circuit, marbles. Each machine sits at its own place in the world. */

import type { BeatState } from '../engine/beatState';
import { A, c, tf, withA } from '../engine/canvas';
import { arrow, circ, fillRR, glow, line, poly, ring, strokeRR } from '../engine/draw';
import { PI, TAU, back, cl, ease, easeIn, lerp } from '../engine/math';
import { C } from '../engine/palette';
import { withCam } from '../engine/parallax';
import { tag, txt } from '../engine/text';
import { bean } from '../kit/bean';
import { flow, floaters, ground } from '../kit/scenery';
import type { Scene } from './types';

const GY = 560, WOOD = '#D9924E', WOODD = '#A8652E';

export const form: Scene = {
  bg: ['#12707C', '#0A2C46'], accent: C.yellow,
  back: function (S, cam, T) {
    withCam(cam, 0.55, dotGrid);
    floaters(cam, T, 21, 12, [C.yellow, C.cyan], 0.4);
  },
  draw: function (S, cam, T) {
    ground(GY, -900, 5200, '#35B8AE', '#167883');
    lever(S, T); pulley(S, T); circuit(S, T); marbles(S, T);
  }
};

function dotGrid(): void {
  c.fillStyle = 'rgba(255,255,255,0.07)';
  for (let x = -200; x < 3000; x += 64) for (let y = 40; y < 470; y += 64) { c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(8,30,50,0.35)'; c.fillRect(-400, 500, 4000, 16);
}

/** Push, hold, release, rest: a repeating 0..1 effort cycle. */
function cyc(u: number, period: number): number {
  if (u < 0) return 0;
  const p = u % period;
  if (p < 0.9) return ease(p / 0.9);
  if (p < 1.9) return 1;
  if (p < 2.7) return 1 - ease((p - 1.9) / 0.8);
  return 0;
}

function rock(x: number, y: number): void {
  circ(x, y, 38, '#9189D6'); circ(x - 22, y + 8, 22, '#9189D6'); circ(x + 20, y + 10, 24, '#9189D6');
  c.save(); c.beginPath(); c.arc(x, y, 38, 0, TAU); c.clip(); circ(x + 22, y + 16, 34, 'rgba(21,15,51,0.2)'); c.restore();
  circ(x - 12, y - 14, 7, 'rgba(255,255,255,0.25)');
}

/* ---------- lever ---------- */

function lever(S: BeatState, T: number): void {
  const l3 = S.since('lever3'), slide = ease((l3 - 0.6) / 1.4), fx = lerp(300, 410, slide);
  const a = fx - 130, b = 690 - fx, py = GY - 40;
  const p = l3 >= 0 ? cyc(l3 - 2.4, 3.4) : cyc(S.since('lever1') - 1.4, 3.4) * (1 - ease((l3 + 0.4) / 0.4));
  const al0 = -Math.asin(40 / a), al1 = Math.asin(40 / b), al = lerp(al0, al1, p);
  const lx = fx - a * Math.cos(al), ly = py - a * Math.sin(al), rx = fx + b * Math.cos(al), ry = py + b * Math.sin(al);
  poly([fx - 38, GY, fx + 38, GY, fx, py + 4], C.yellow); poly([fx, py + 4, fx + 38, GY, fx + 8, GY], 'rgba(21,15,51,0.18)');
  tf(fx, py, 1, al, function () { fillRR(-a - 14, -9, a + b + 28, 18, 9, WOOD); fillRR(-a - 14, 2, a + b + 28, 7, 4, WOODD); });
  rock(lx + 10, ly - 44);
  bean({ x: rx + 84, y: GY, s: 0.95, t: T, color: C.orange, reachL: [rx - 6, ry - 12], reachR: [rx + 10, ry - 12], squash: p * 0.6, look: [-0.7, 0.3], mouth: p > 0.15 ? 'o' : 'smile', phase: 1 });
  leverGauges(S, a, b);
  if (slide > 0 && slide < 1) { A(Math.sin(slide * PI)); arrow(fx - 60, GY + 34, fx + 30, GY + 34, C.yellow, 6); A(1); }
}

/** What this form does: how far it lifts, how hard you must push. */
function leverGauges(S: BeatState, a: number, b: number): void {
  const liftV = (40 + a * 40 / b) / 80, effV = Math.min(1, (a / b));
  const ga = S.on('lever2', 0.8, 0.5);
  if (ga > 0) withA(ga, function () {
    txt('lift', 250, 196, 30, C.cream, 'right', 600); fillRR(266, 184, 240, 24, 12, 'rgba(12,8,40,0.5)'); fillRR(266, 184, 240 * liftV, 24, 12, C.cyan);
    txt('effort', 250, 240, 30, C.cream, 'right', 600); fillRR(266, 228, 240, 24, 12, 'rgba(12,8,40,0.5)'); fillRR(266, 228, 240 * effV, 24, 12, C.pink);
  });
}

/* ---------- pulley ---------- */

function pulley(S: BeatState, T: number): void {
  const ox = 1500, p = cyc(S.since('pulley') - 1.5, 3.6), travel = 130, cy = GY - 330;
  fillRR(ox - 240, GY - 420, 20, 420, 6, WOODD); fillRR(ox + 220, GY - 420, 20, 420, 6, WOODD);
  fillRR(ox - 262, GY - 436, 524, 26, 10, WOOD);
  line([ox, GY - 412, ox, cy], C.grey, 8);
  const hy = GY - 190 + p * travel, crateY = GY - p * travel;
  line([ox - 46, cy, ox - 46, crateY - 84], C.cream, 5); line([ox + 46, cy, ox + 46, hy + 46], C.cream, 5);
  c.beginPath(); c.arc(ox, cy, 46, PI, 0); c.strokeStyle = C.cream; c.lineWidth = 5; c.stroke();
  circ(ox, cy, 42, C.purple); ring(ox, cy, 42, C.violet, 5);
  tf(ox, cy, 1, p * travel / 46, function () { for (let i = 0; i < 4; i++) line([0, 0, Math.cos(i * PI / 2) * 36, Math.sin(i * PI / 2) * 36], C.violet, 5); });
  circ(ox, cy, 9, C.cream);
  crate(ox, crateY);
  bean({ x: ox + 122, y: GY, s: 0.95, t: T, color: C.teal, reachL: [ox + 46, hy], reachR: [ox + 46, hy + 22], squash: p * 0.6, look: [-0.5, -0.5 + p], mouth: p > 0.15 ? 'o' : 'smile', phase: 2 });
  if (p > 0.02 && p < 0.98) { A(Math.sin(p * PI)); arrow(ox + 190, GY - 200, ox + 190, GY - 110, C.pink, 7); arrow(ox - 150, GY - 60, ox - 150, GY - 150, C.cyan, 7); A(1); }
}

function crate(ox: number, crateY: number): void {
  fillRR(ox - 96, crateY - 84, 100, 84, 8, C.pink); fillRR(ox - 96, crateY - 84, 100, 84, 8, 'rgba(21,15,51,0.1)');
  line([ox - 88, crateY - 76, ox - 4, crateY - 8], 'rgba(21,15,51,0.25)', 6); line([ox - 4, crateY - 76, ox - 88, crateY - 8], 'rgba(21,15,51,0.25)', 6);
  strokeRR(ox - 96, crateY - 84, 100, 84, 8, 'rgba(21,15,51,0.3)', 5);
}

/* ---------- circuit ---------- */

const OFF = '#2A6878', ON = C.yellow;

function circuit(S: BeatState, T: number): void {
  const uc = S.since('cut'), ub = S.since('back'), u = S.since('circuit');
  const isCut = uc > 1.0 && ub < 0;
  let pat: number[][], k: number;
  if (uc >= 0 && ub < 0) { pat = [[1, 1], [1, 1], [0, 1], [1, 1]]; k = Math.floor(uc / 1.6) % 4; }
  else { pat = [[0, 0], [1, 0], [0, 1], [1, 1]]; k = u < 0.6 ? 0 : Math.floor((u - 0.6) / 1.6) % 4; }
  const Av = pat[k][0], Bv = pat[k][1], Bx = isCut ? 0 : Bv, ones = Av ^ Bx, twos = Av & Bv;
  function wire(pts: number[], v: number): void { line(pts, v ? ON : OFF, 7); if (v) flow(pts, T, 120, 46, 4, C.white); }
  line([2440, 500, 2440, GY], '#0A2A38', 16); line([2960, 500, 2960, GY], '#0A2A38', 16);
  fillRR(2382, 164, 636, 344, 26, 'rgba(0,0,0,0.25)'); fillRR(2382, 156, 636, 344, 26, '#0E3F52'); strokeRR(2394, 168, 612, 320, 18, 'rgba(111,227,240,0.25)', 3);
  wire([2484, 240, 2630, 240], Av);
  line([2550, 240, 2550, 400, 2578, 400], Av ? ON : OFF, 7);
  c.beginPath(); c.arc(2590, 400, 12, PI, 0); c.strokeStyle = Av ? ON : OFF; c.lineWidth = 7; c.stroke();
  wire([2602, 400, 2630, 400], Av);
  wire([2484, 432, 2630, 432], Bv);
  if (isCut) {
    line([2590, 432, 2590, 358], Bv ? ON : OFF, 7); line([2590, 322, 2590, 272, 2630, 272], OFF, 7);
    line([2584, 358, 2590, 350, 2596, 358], Bv ? ON : OFF, 4);
  } else wire([2590, 432, 2590, 272, 2630, 272], Bv);
  wire([2770, 255, 2896, 255], ones); wire([2770, 415, 2896, 415], twos);
  switches(Av, Bv);
  gates();
  lamps(ones, twos);
  sumTag(Av, Bv, ones + 2 * twos, T);
  scissors(uc);
  lid(ub);
}

function switches(Av: number, Bv: number): void {
  ([[240, Av, 'A'], [432, Bv, 'B']] as [number, number, string][]).forEach(function (q) {
    fillRR(2416, q[0] - 24, 68, 48, 24, q[1] ? ON : '#17566B'); circ(q[1] ? 2460 : 2440, q[0], 18, C.cream);
    txt(String(q[1]), q[1] ? 2460 : 2440, q[0] + 1, 26, C.ink, 'center', 700);
  });
}

function gates(): void {
  ([[213, 'XOR'], [373, 'AND']] as [number, string][]).forEach(function (q) {
    fillRR(2630, q[0], 140, 84, 20, C.teal); fillRR(2630, q[0] + 60, 140, 24, 12, 'rgba(21,15,51,0.14)'); txt(q[1], 2700, q[0] + 43, 34, C.ink, 'center', 700);
  });
}

function lamps(ones: number, twos: number): void {
  ([[255, ones, 'ones'], [415, twos, 'twos']] as [number, number, string][]).forEach(function (q) {
    if (q[1]) glow(2925, q[0], 70, C.yellow, 0.55);
    circ(2925, q[0], 28, q[1] ? C.yellow : '#17566B'); ring(2925, q[0], 28, C.cream, 4);
    txt(q[2], 2925, q[0] + 50, 24, C.cream, 'center', 600);
  });
}

function sumTag(Av: number, Bv: number, val: number, T: number): void {
  const wrong = val !== Av + Bv;
  tf(2700 + (wrong ? Math.sin(T * 40) * 3 : 0), 112, 1, 0, function () { tag(Av + ' + ' + Bv + ' = ' + val, 0, 0, 52, wrong ? C.pink : C.cream, C.ink, 700); });
}

function scissors(uc: number): void {
  if (uc > 0.5 && uc < 2.2) {
    const sp = back((uc - 0.5) / 0.35), op = uc < 1.0 ? 0.5 : 0.05;
    A(1 - cl((uc - 1.7) / 0.4));
    tf(2552, 340, sp, 0, function () {
      line([-34, -14 - op * 20, 30, 6], C.cream, 6); line([-34, 14 + op * 20, 30, -6], C.cream, 6);
      ring(-42, -18 - op * 20, 10, C.pink, 5); ring(-42, 18 + op * 20, 10, C.pink, 5);
    });
    A(1);
  }
}

/** The lid: you can tell what is inside from what it does. */
function lid(ub: number): void {
  if (ub >= 0) {
    const lidUp = ease((ub - 5.4) / 0.9), la = ease(ub / 0.4) * (1 - lidUp);
    if (la > 0) withA(la, function () { fillRR(2508, 190 - lidUp * 120, 286, 288, 22, '#062430'); txt('?', 2651, 336 - lidUp * 120, 150, C.cyan, 'center', 700); });
  }
}

/* ---------- marbles ---------- */

const PX = 3800, PY = 360;

function marbles(S: BeatState, T: number): void {
  const u = S.since('marble') - 0.8, t = u < 0 ? 0 : u % 6.6;
  line([3640, 510, 3640, GY], '#3B1F66', 16); line([3960, 510, 3960, GY], '#3B1F66', 16);
  fillRR(3572, 158, 456, 360, 26, 'rgba(0,0,0,0.25)'); fillRR(3572, 150, 456, 360, 26, '#4A2A82'); strokeRR(3584, 162, 432, 336, 18, 'rgba(255,255,255,0.14)', 3);
  line([3782, 166, 3782, 286], C.cream, 6); line([3818, 166, 3818, 286], C.cream, 6);
  const th = 0.26 - 0.52 * ease((t - 1.1) / 0.4) + 0.52 * ease((t - 3.4) / 0.4);
  function onBeam(lx: number): number[] { return [PX + lx * Math.cos(th) + 18 * Math.sin(th), PY + lx * Math.sin(th) - 18 * Math.cos(th)]; }
  ([[3690, 'ones'], [3910, 'twos']] as [number, string][]).forEach(function (q) {
    c.beginPath(); c.arc(q[0], 448, 30, 0, PI); c.strokeStyle = C.cream; c.lineWidth = 6; c.stroke();
    txt(q[1], q[0], 492, 24, C.cream, 'center', 600);
  });
  const fade = 1 - ease((t - 6.1) / 0.4);
  function marble(m: number[] | null): void {
    if (!m) return;
    A(m[2] * fade); circ(m[0], m[1], 13, C.cyan); circ(m[0] - 4, m[1] - 4, 4, 'rgba(255,255,255,0.7)'); A(1);
  }
  if (u >= 0) { marble(firstMarble(t, onBeam)); marble(secondMarble(t, onBeam)); }
  tf(PX, PY, 1, th, function () { fillRR(-108, -6, 216, 12, 6, C.yellow); fillRR(-5, -54, 10, 52, 5, C.yellow); });
  circ(PX, PY, 9, C.cream); poly([PX - 16, PY + 34, PX + 16, PY + 34, PX, PY + 4], C.orange);
  const label = u < 0 || t < 1.9 ? '…' : t < 2.6 ? '1' : t < 4.6 ? '1 + 1' : '1 + 1 = 2';
  tag(label, 3800, 106, 52, C.cream, C.ink, 700);
}

/** Drops, tips the rocker left, lands in "ones", later falls through. Returns [x, y, alpha]. */
function firstMarble(t: number, onBeam: (lx: number) => number[]): number[] | null {
  if (t < 0.3) return null;
  if (t < 1.1) return [3793, lerp(176, 339, easeIn((t - 0.3) / 0.8)), 1];
  if (t < 1.9) { const m = onBeam(lerp(-12, -104, ease((t - 1.1) / 0.8))); m[2] = 1; return m; }
  if (t < 2.3) { const e1 = onBeam(-104), q1 = easeIn((t - 1.9) / 0.4); return [lerp(e1[0], 3690, q1), lerp(e1[1], 462, q1), 1]; }
  if (t < 3.7) return [3690, 462, 1];
  const d = cl((t - 3.7) / 0.5);
  return [3690, 462 + d * 70, 1 - d];
}

/** Drops, tips the rocker right, lands in "twos". */
function secondMarble(t: number, onBeam: (lx: number) => number[]): number[] | null {
  if (t < 2.6) return null;
  if (t < 3.4) return [3807, lerp(176, 339, easeIn((t - 2.6) / 0.8)), 1];
  if (t < 4.2) { const n = onBeam(lerp(12, 104, ease((t - 3.4) / 0.8))); n[2] = 1; return n; }
  if (t < 4.6) { const e2 = onBeam(104), q2 = easeIn((t - 4.2) / 0.4); return [lerp(e2[0], 3910, q2), lerp(e2[1], 462, q2), 1]; }
  return [3910, 462, 1];
}
