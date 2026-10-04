/* 2. Form is function: a rolling shape, then lever, pulley, circuit. Each sits at its own place in the world. */

import type { BeatState } from '@studio/engine/beatState';
import { A, c, tf, withA } from '@studio/engine/canvas';
import { arrow, circ, fillRR, glow, line, poly, ring, strokeRR } from '@studio/engine/draw';
import { PI, TAU, back, cl, ease, lerp } from '@studio/engine/math';
import { C } from '@studio/engine/palette';
import { withCam } from '@studio/engine/parallax';
import { tag, txt } from '@studio/engine/text';
import { bean } from '@studio/library/characters/bean';
import { flow, floaters, ground } from '@studio/library/backgrounds/scenery';
import type { Scene } from '@studio/engine/scene';

const GY = 560, WOOD = '#D9924E', WOODD = '#A8652E';

export const form: Scene = {
  bg: ['#12707C', '#0A2C46'], accent: C.yellow,
  back: function (S, cam, T) {
    withCam(cam, 0.55, dotGrid);
    floaters(cam, T, 21, 12, [C.yellow, C.cyan], 0.4);
  },
  draw: function (S, cam, T) {
    ground(GY, -1600, 3600, '#35B8AE', '#167883');
    opener(S); lever(S, T); pulley(S, T); circuit(S, T);
  }
};

function dotGrid(): void {
  c.fillStyle = 'rgba(255,255,255,0.07)';
  for (let x = -1032; x < 3000; x += 64) for (let y = 40; y < 470; y += 64) { c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(8,30,50,0.35)'; c.fillRect(-1200, 500, 4800, 16);
}

/* ---------- opener: form decides what a thing does; what it does gives its form away ---------- */

const OX = -640, R = 34, SHAPE = C.pink;
/** The ramp runs from its top corner (RTX, RTY) down to the ground at RBX. */
const RTX = OX - 300, RTY = GY - 170, RBX = OX + 80;
const RL = Math.hypot(RBX - RTX, GY - RTY), RA = Math.atan2(GY - RTY, RBX - RTX), DX = Math.cos(RA), DY = Math.sin(RA);
/** Path length of a roller's centre: start on the ramp, then where each roller comes to rest on the floor. */
const S0 = R + 12, FLOOR = RL + R * RA, REST1 = FLOOR + 250, REST2 = FLOOR + 140;
/** Seconds into "betray" when the shape starts to change, then to roll. */
const MORPH = 0.3, ROLL = 1.1;

function opener(S: BeatState): void {
  const bt = S.since('betray'), half = secondHalf(S);
  ramp();
  shapeOnRamp(S, bt);
  mysteryRoller(bt - half);
  formFunctionTag(S, bt, half);
}

/** "And what it does betrays its shape" starts about here: proportional to the beat, never before the first roll ends. */
function secondHalf(S: BeatState): number {
  const k = S.ch.idx['betray'];
  return k === undefined ? 1e9 : Math.max(ROLL + 2.1, 0.55 * S.ch.beats[k].dur);
}

function ramp(): void {
  poly([RTX, GY, RTX, RTY, RBX, GY], WOOD);
  poly([RTX, GY, RTX + 24, GY, RTX + 24, RTY + DY / DX * 24, RTX, RTY], WOODD);
  line([RTX, RTY, RBX, GY], WOODD, 6);
}

/** Centre and spin of a roller `s` along its path: down the ramp, over the corner, along the floor. */
function rollAt(s: number): [number, number, number] {
  const spin = RA + (s - S0) / R;
  if (s < RL) return [RTX + DX * s + DY * R, RTY + DY * s - DX * R, spin];
  if (s < FLOOR) { const ph = RA - (s - RL) / R; return [RBX + Math.sin(ph) * R, GY - Math.cos(ph) * R, spin]; }
  return [RBX + s - FLOOR, GY - R, spin];
}

/** A square block sits on the ramp. Round it off and it rolls away. */
function shapeOnRamp(S: BeatState, bt: number): void {
  const k = S.pop('thesis', 0.3);
  if (k <= 0) return;
  const round = ease((bt - MORPH) / 0.7), p = rollAt(lerp(S0, REST1, ease((bt - ROLL) / 2.0)));
  tf(p[0], p[1], k, p[2], function () { roller(lerp(4, R, round)); });
}

function roller(corner: number): void {
  fillRR(-R, -R, 2 * R, 2 * R, corner, SHAPE);
  line([0, 0, R - 9, 0], 'rgba(21,15,51,0.3)', 7);
  circ(0, 0, 7, C.cream);
}

/** Something unknown rolls down the same ramp. Because it rolls, it turns out round. */
function mysteryRoller(u: number): void {
  const k = back(u / 0.45);
  if (k <= 0) return;
  const p = rollAt(lerp(S0, REST2, ease((u - 0.4) / 1.6))), seen = ease((u - 2.1) / 0.35);
  if (seen < 1) withA(1 - seen, function () {
    glow(p[0], p[1], R * 2, C.cyan, 0.45);
    tf(p[0], p[1], k, p[2] - RA, function () { txt('?', 0, 0, 88, C.cyan, 'center', 700); });
  });
  if (seen > 0) withA(seen, function () { tf(p[0], p[1], back((u - 2.1) / 0.45), p[2], function () { roller(R); }); });
}

/** "form" and "function", joined by = and then by an arrow each way. */
function formFunctionTag(S: BeatState, bt: number, half: number): void {
  const k = S.on('thesis', 1.0, 0.4);
  if (k <= 0) return;
  const y = GY - 290, lx = OX - 120, rx = OX + 190;
  withA(k, function () {
    tag('form', lx, y, 38, C.ink, C.cream, 700); tag('function', rx, y, 38, C.ink, C.cream, 700);
    const link = bt < 0 ? 0 : bt < half ? 1 : 2, pop = link === 0 ? S.pop('thesis', 1.0) : link === 1 ? S.pop('betray', MORPH) : S.pop('betray', half);
    tf((lx + rx) / 2 - 18, y, pop, 0, function () {
      if (link === 0) txt('=', 0, 0, 56, C.yellow, 'center', 700);
      else if (link === 1) arrow(-40, 0, 40, 0, C.yellow, 8);
      else arrow(40, 0, -40, 0, C.yellow, 8);
    });
  });
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
  const uc = S.since('cut'), u = S.since('circuit');
  const isCut = uc > 1.0;
  let pat: number[][], k: number;
  if (uc >= 0) { pat = [[1, 1], [1, 1], [0, 1], [1, 1]]; k = Math.floor(uc / 1.6) % 4; }
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
