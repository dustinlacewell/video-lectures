/* 1. Physics: only physical things push. A domino chain, a lone domino, and visitors who fail to move it. */

import type { BeatState } from '@studio/engine/beatState';
import { A, GA, c, tf, withA } from '@studio/engine/canvas';
import { check, circ, cross, ell, glow, fillRR, line, ring } from '@studio/engine/draw';
import { PI, TAU, back, cl, ease, easeIn, easeOut, lerp } from '@studio/engine/math';
import { C } from '@studio/engine/palette';
import { withCam } from '@studio/engine/parallax';
import { tag } from '@studio/engine/text';
import { hand } from '@studio/library/characters/hand';
import { floaters, ground, stars } from '@studio/library/backgrounds/scenery';
import { ghost, spirit, thought, type Visitor } from '../kit/spirits';
import { DELTA, GY, LONE, N, PUSH, dh, ds, dw, thHit, x0 } from './01-physics.layout';
import type { Scene } from '@studio/engine/scene';

export const physics: Scene = {
  bg: ['#1B3A8A', '#0E1547'], accent: C.cyan,
  back: function (S, cam, T) {
    stars(cam, T, 3, 170, 0.22);
    withCam(cam, 0.3, planet);
    floaters(cam, T, 4, 10, [C.cyan, C.purple], 0.5);
  },
  draw: function (S, cam, T) {
    const th = angles(S.since('fall') - PUSH), lat = cl(cam.z - 2.0);
    ground(GY, -900, 3200, '#4C6BE0', '#253A94');
    for (let i = N - 1; i >= 0; i--) domino(x0 + i * ds, th[i], true, i < 4 ? lat : 0, T);
    lawProbes(S, T);
    closeUpLabel(S);
    pushingFinger(S);
    loneDomino(S, T);
    gapMarker(S);
    VISITORS.forEach(function (k) { visitor(k, S, T); });
    failMarks(S);
    fingerOnLone(S);
  }
};

function planet(): void {
  glow(1050, 150, 190, '#5E7BFF', 0.25); circ(1050, 150, 74, '#3D5BD6');
  c.save(); c.beginPath(); c.arc(1050, 150, 74, 0, TAU); c.clip(); circ(1080, 180, 80, 'rgba(21,15,51,0.25)'); c.restore();
  ell(1050, 150, 120, 20, 'rgba(111,227,240,0.35)', -0.3);
}

/* ---------- the chain ---------- */

/** A leaning domino rests its top corner on the next one's face: exact contact, so nothing overlaps. */
function rest(thn: number): number { return thn + Math.asin((ds * Math.cos(thn) - dw) / dh); }

function angles(u: number): number[] {
  const th: number[] = [];
  for (let i = N - 1; i >= 0; i--) {
    const ui = u - i * DELTA;
    if (ui <= 0) th[i] = 0;
    else if (i === N - 1) th[i] = Math.min(PI / 2, thHit * Math.pow(ui / DELTA, 2));
    else if (ui < DELTA) th[i] = thHit * Math.pow(ui / DELTA, 2);
    else th[i] = rest(th[i + 1]);
  }
  return th;
}

function domino(x: number, th: number, pivotRight: boolean, lattice: number, T: number): void {
  c.save();
  if (pivotRight) { c.translate(x + dw, GY); c.rotate(th); c.translate(-dw, 0); }
  else { c.translate(x, GY); c.rotate(-th); }
  fillRR(0, -dh, dw, dh, 5, C.cream);
  c.fillStyle = 'rgba(21,15,51,0.16)'; c.fillRect(dw - 6, -dh + 3, 4, dh - 6);
  if (lattice > 0) particleLattice(lattice, T);
  else {
    line([4, -dh / 2, dw - 4, -dh / 2], 'rgba(21,15,51,0.35)', 2);
    circ(dw / 2, -dh * 0.76, 3.6, C.ink); circ(dw / 2, -dh * 0.3, 3.6, C.ink); circ(dw / 2, -dh * 0.16, 3.6, C.ink);
  }
  c.restore();
}

/** Seen very close up, a domino is a jiggling lattice of particles. */
function particleLattice(lattice: number, T: number): void {
  c.globalAlpha = GA * lattice * 0.5;
  for (let i = 0; i < 5; i++) line([3 + i * 4.5, -dh + 4, 3 + i * 4.5, -4], C.purple, 0.35);
  for (let j = 0; j < 30; j++) line([3, -dh + 4 + j * 4.55, 21, -dh + 4 + j * 4.55], C.purple, 0.35);
  c.globalAlpha = GA * lattice;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 30; j++) {
    const k = i * 31 + j;
    circ(3 + i * 4.5 + Math.sin(T * 7 + k * 1.3) * 0.4, -dh + 4 + j * 4.55 + Math.cos(T * 6 + k * 2.1) * 0.4, 1.25, (i + j) % 2 ? C.pink : C.purple);
  }
  c.globalAlpha = GA;
}

/** Tested: a probe searches the lattice and finds no extra push. */
function lawProbes(S: BeatState, T: number): void {
  const la = S.on('laws', 0.6, 0.6) * (1 - S.on('fall', 0, 0.4));
  if (la > 0) withA(la, function () {
    const p2 = S.pop('laws', 3.7);
    if (p2 > 0) tf(330, 420, p2, 0, function () { tag('no extra push found', 0, 0, 9.5, C.ink, C.cream); });
    const sx = 212 + Math.sin(T * 1.3) * 9, sy = 440 + Math.cos(T * 0.9) * 40;
    ring(sx, sy, 7, C.yellow, 1.2); line([sx + 5, sy + 5, sx + 11, sy + 11], C.yellow, 1.6);
  });
}

function closeUpLabel(S: BeatState): void {
  const ca = S.on('atoms', 0.8, 0.5) * (1 - S.on('laws', 0, 0.4));
  if (ca > 0) withA(ca, function () { tag('a domino, very close up', 104, 404, 9.5, C.ink, C.cream); });
}

/** The finger that starts the chain. */
function pushingFinger(S: BeatState): void {
  const f = S.since('fall');
  if (f > 0 && f < 2.6) {
    const fx = f < PUSH ? lerp(-60, x0 - 2, easeIn(f / PUSH)) : lerp(x0 + 6, -140, ease((f - PUSH - 0.15) / 1.0));
    c.save(); c.translate(fx, GY - 104); c.scale(-1, 1); hand(0, 0, 1); c.restore();
  }
}

function loneDomino(S: BeatState, T: number): void {
  const fl = S.since('finger'), lth = fl > 1.0 ? easeIn((fl - 1.0) / 0.55) * PI / 2 : 0;
  domino(LONE, lth, false, 0, T);
}

function gapMarker(S: BeatState): void {
  const gp = S.on('stop', 0.9, 0.5) * (1 - S.on('ghost', 0, 0.4));
  if (gp > 0) withA(gp, function () {
    line([1176, GY - 176, 1406, GY - 176], C.yellow, 4, [10, 10]);
    line([1176, GY - 190, 1176, GY - 162], C.yellow, 4); line([1406, GY - 190, 1406, GY - 162], C.yellow, 4);
    tag('nothing reached it', 1291, GY - 222, 30, C.yellow, C.ink);
  });
}

/* ---------- the visitors ---------- */

type VisitorKind = 'ghost' | 'spirit' | 'thought';
const VISITORS: VisitorKind[] = ['ghost', 'spirit', 'thought'];
const DRAW: Record<VisitorKind, Visitor> = { ghost: ghost, spirit: spirit, thought: thought };
/** Where each visitor sulks after failing. */
const SULK: Record<VisitorKind, number> = { ghost: 1610, spirit: 1700, thought: 1795 };
/** Seconds into its beat when each visitor fails. */
const FAILT: Record<VisitorKind, number> = { ghost: 2.7, spirit: 3.4, thought: 3.3 };

interface Pose { x: number; y: number; a: number; mood: string; shake: number; sc: number; flip: boolean }

/** Each visitor tries the lone domino and fails in its own way. */
function visitor(kind: VisitorKind, S: BeatState, T: number): void {
  const u = S.since(kind);
  if (u < 0) return;
  const p = kind === 'ghost' ? ghostPose(u) : kind === 'spirit' ? spiritPose(u) : thoughtPose(u);
  const jump = S.since('finger') > 1.55 ? Math.abs(Math.sin(cl((S.since('finger') - 1.55) / 0.5) * PI)) * 40 : 0;
  DRAW[kind](p.x, p.y - jump, p.sc, { t: T, alpha: p.a, mood: jump > 1 ? '' : p.mood, flip: p.flip, shake: p.shake });
  if (kind === 'thought' && p.shake) {
    const d = (u * 1.6) % 1;
    A(1 - d); circ(1560 + d * 30, GY - 150 - d * 30, 5, C.cyan); circ(1575 + d * 22, GY - 120 - d * 40, 4, C.cyan); A(1);
  }
}

/** Fly in from the right and arrive at (toX, toY) at u = 1.2, where the visitor's own move begins. */
function basePose(u: number, toX: number, toY: number): Pose {
  const e = easeOut(u / 1.2);
  return { x: lerp(2000, toX, e), y: lerp(GY - 150, toY, e), a: 1, mood: '', shake: 0, sc: 1, flip: false };
}

/** Sulk home: drift to the side, shrink, look sad. */
function sulk(p: Pose, fromX: number, fromY: number, q: number, home: number): void {
  p.x = lerp(fromX, home, q); p.y = lerp(fromY, GY - 66, q); p.sc = lerp(1, 0.78, q); p.mood = 'sad';
}

/** The ghost passes straight through. */
function ghostPose(u: number): Pose {
  const p = basePose(u, 1570, GY - 150);
  if (u < 1.2) return p;
  if (u < 1.8) { p.x = 1570 + ease((u - 1.2) / 0.6) * 30; return p; }
  if (u < 2.6) { const e = ease((u - 1.8) / 0.8); p.x = lerp(1600, 1310, e); p.a = 1 - 0.5 * Math.sin(e * PI); return p; }
  if (u < 3.6) { p.x = 1310; p.mood = 'sad'; p.flip = true; return p; }
  const q = ease((u - 3.6) / 1.0);
  sulk(p, 1310, GY - 150, q, SULK.ghost); p.flip = true; p.a = 1 - 0.4 * Math.sin(q * PI);
  return p;
}

/** The spirit circles the domino twice. */
function spiritPose(u: number): Pose {
  const p = basePose(u, 1560, GY - 80);
  if (u < 1.2) return p;
  if (u < 3.4) { const ang = ease((u - 1.2) / 2.2) * TAU * 2; p.x = 1432 + Math.cos(ang) * 128; p.y = GY - 80 + Math.sin(ang) * 86; return p; }
  sulk(p, 1560, GY - 80, ease((u - 3.4) / 0.9), SULK.spirit);
  return p;
}

/** The thought strains at it. */
function thoughtPose(u: number): Pose {
  const p = basePose(u, 1508, GY - 96);
  if (u < 1.2) return p;
  if (u < 3.3) { p.x = 1508; p.y = GY - 96; p.shake = 1; return p; }
  sulk(p, 1508, GY - 96, ease((u - 3.3) / 0.9), SULK.thought);
  return p;
}

function failMarks(S: BeatState): void {
  VISITORS.forEach(function (k) {
    const q = S.since(k) - FAILT[k];
    if (q > 0 && q < 1.6) {
      A(1 - cl((q - 1.1) / 0.5));
      tf(1432, GY - 200, back(q / 0.4), 0, function () { circ(0, 0, 26, C.red); cross(0, 0, 10, C.white, 6); });
      A(1);
    }
  });
}

/** A real finger tips the lone domino. */
function fingerOnLone(S: BeatState): void {
  const fl = S.since('finger');
  if (fl > 0 && fl < 3.4) {
    const hu = fl < 1.0 ? easeIn(fl / 1.0) : 1 - ease((fl - 1.2) / 1.2);
    hand(lerp(1700, LONE + dw + 3, hu), lerp(GY - 300, GY - 112, hu), 1, lerp(-0.5, 0, hu));
  }
  if (fl > 1.6) {
    A(1 - cl((fl - 2.6) / 0.5));
    tf(LONE - 60, GY - 210, back((fl - 1.6) / 0.4), 0, function () { circ(0, 0, 26, C.green); check(0, 0, 24, C.white, 6); });
    A(1);
  }
}
