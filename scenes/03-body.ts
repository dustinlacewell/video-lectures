/* 3. The body: the arm, traced back into the brain. */

import type { BeatState } from '../engine/beatState';
import { A, c, tf, withA } from '../engine/canvas';
import { circ, cross, ell, glow, line, rr } from '../engine/draw';
import { PI, TAU, back, cl, ease, easeOut, lerp, rng } from '../engine/math';
import { C } from '../engine/palette';
import { tag } from '../engine/text';
import type { Cam } from '../script/types';
import { bean } from '../kit/bean';
import { badge, type IconKind } from '../kit/icons';
import { along, flow, floaters, ground, stars } from '../kit/scenery';
import { ghost } from '../kit/spirits';
import { CHAIN, LOOP } from './03-body.layout';
import type { Scene } from './types';

const BX = 640, BY = 650, BS = 2.3, BR = [640, 290];
/** The firing chain: neurons that fire in order. */
const PATH = [[586, 298], [602, 280], [621, 299], [640, 279], [659, 297], [675, 283], [692, 304]];
const NODES = scatterNodes();
const EDGES = nearestEdges();

export const body: Scene = {
  bg: ['#6A2F8F', '#2A1352'], accent: C.pink,
  back: function (S, cam, T) { floaters(cam, T, 33, 16, [C.pink, C.violet, C.orange], 0.35); stars(cam, T, 12, 50, 0.15, '#FFD0E8'); },
  draw: function (S, cam, T) {
    const sl = S.since('lift'), sm = S.since('muscle');
    const up = (ease((sl - 1.2) / 0.7) * (1 - ease((sm - 0.2) / 0.8)) + ease((sm - 1.8) / 0.8)) * (1 - S.on('list', 0, 0.8));
    const ang = lerp(0.14, 2.55, up), bob = Math.sin(T * 2.1) * 2.5 * BS;
    ground(BY, -900, 2400, '#9B55C9', '#4A2480');
    bean({ x: BX, y: BY, s: BS, t: T, color: C.orange, armR: ang, armL: S.is('you') ? 2.4 + Math.sin(T * 5) * 0.2 : 0.14, look: [0.5 * up, -0.4 * up], mouth: S.is('you') ? 'grin' : 'smile' });
    bodyLattice(S, cam, T, bob);
    xray(S, cam, T, bob, ang, sm);
    insideBrain(S, cam, T, bob);
    faculties(S);
  }
};

function scatterNodes(): number[][] {
  const r = rng(31), n = PATH.slice();
  while (n.length < 24) {
    const a = r() * TAU, d = Math.sqrt(r());
    const p = [BR[0] + Math.cos(a) * 60 * d, BR[1] + Math.sin(a) * 32 * d];
    let ok = true;
    for (let i = 0; i < n.length; i++) if (Math.hypot(n[i][0] - p[0], n[i][1] - p[1]) < 11) ok = false;
    if (ok) n.push(p);
  }
  return n;
}

/** Each non-chain neuron links to its two nearest neighbours. */
function nearestEdges(): number[][] {
  const e: number[][] = [];
  for (let i = CHAIN; i < NODES.length; i++) {
    const d = NODES.map(function (q, k) { return [Math.hypot(q[0] - NODES[i][0], q[1] - NODES[i][1]), k]; }).sort(function (a, b) { return a[0] - b[0]; });
    for (let j = 1; j <= 2; j++) e.push([i, d[j][1]]);
  }
  return e;
}

/** The same lattice of particles as the domino. */
function bodyLattice(S: BeatState, cam: Cam, T: number, bob: number): void {
  const lat = cl((cam.z - 2.0) / 1.4) * (1 - S.on('lift', 0, 0.3));
  if (lat > 0) {
    c.save(); rr(BX - 138, BY - 418.6 + bob, 276, 400, 133); c.clip();
    c.globalAlpha = lat * 0.9;
    for (let gx = 0; gx < 32; gx++) for (let gy = 0; gy < 30; gy++) {
      const k = gx * 37 + gy;
      circ(506 + gx * 9 + Math.sin(T * 7 + k * 1.3) * 0.8, 380 + gy * 9 + Math.cos(T * 6 + k * 2.1) * 0.8, 2.4, (gx + gy) % 2 ? C.pink : C.purple);
    }
    c.restore(); c.globalAlpha = 1;
  }
}

/** X-ray: brain, nerve, muscle. */
function xray(S: BeatState, cam: Cam, T: number, bob: number, ang: number, sm: number): void {
  const xr = S.on('muscle', 0.2, 0.7) * (1 - S.on('list', 0, 0.6));
  const sx = BX + 54 * BS, sy = BY - 108 * BS + bob, L = 62 * BS, dx = Math.sin(ang), dy = Math.cos(ang);
  const mx = sx + dx * L * 0.42, my = sy + dy * L * 0.42;
  const nerve = [692, 304 + bob, 752, 316 + bob, 764, 372 + bob, sx, sy, mx, my];
  if (xr > 0) withA(xr, function () {
    ell(BR[0], BR[1] + bob, 72, 44, '#FF9DBB');
    c.save(); c.beginPath(); c.ellipse(BR[0], BR[1] + bob, 72, 44, 0, 0, TAU); c.clip(); ell(BR[0] + 26, BR[1] + bob + 16, 62, 40, 'rgba(21,15,51,0.13)'); c.restore();
    line(nerve, C.yellow, 5);
    const sq = ease((sm - 1.8) / 0.8) * (1 - S.on('list', 0, 0.5));
    tf(mx, my, 1, Math.atan2(dy, dx), function () { ell(0, 0, lerp(46, 34, sq), lerp(15, 24, sq), C.red); ell(-6, -5, 16, 5, 'rgba(255,255,255,0.3)'); });
    const mt = S.pop('muscle', 2.0);
    if (mt > 0 && cam.z < 4) tf(mx + 96, my + 6, mt, 0, function () { tag('muscle shortens', 0, 0, 17, C.cream, C.ink); });
    const nt = S.pop('muscle', 4.4);
    if (nt > 0 && cam.z < 4) tf(650, 392 + bob, nt, 0, function () { tag('nerve fires', 0, 0, 17, C.yellow, C.ink); });
    if (sm > 4.3) flow(nerve, T, 90, 34, 4, C.white);
  });
}

const SOURCES: [IconKind, number, number, string, number][] = [['eye', 563, 270, C.teal, 0.6], ['book', 557, 298, C.purple, 2.0], ['love', 565, 326, C.red, 3.4]];

/** Inside the brain: the network, the firing chain, its sources, and a ghost that cannot get in. */
function insideBrain(S: BeatState, cam: Cam, T: number, bob: number): void {
  const net = cl((cam.z - 3.2) / 1.6);
  if (net > 0) withA(net, function () {
    c.save(); c.translate(0, bob);
    network(S, T);
    /* what you saw, learned, wanted */
    SOURCES.forEach(function (q) {
      const p = S.pop('trace', q[4]);
      if (p <= 0) return;
      A(p); line([q[1] + 6, q[2], PATH[0][0], PATH[0][1]], C.yellow, 0.8, [2, 2]); A(1);
      badge(q[0], q[1], q[2], 7.5, q[3], { scale: p });
    });
    c.restore();
    ghostTriesToReachIn(S, T, bob);
  });
}

function network(S: BeatState, T: number): void {
  EDGES.forEach(function (e) { line([NODES[e[0]][0], NODES[e[0]][1], NODES[e[1]][0], NODES[e[1]][1]], 'rgba(120,40,90,0.35)', 0.6); });
  for (let i = 0; i < CHAIN - 1; i++) line([PATH[i][0], PATH[i][1], PATH[i + 1][0], PATH[i + 1][1]], 'rgba(120,40,90,0.7)', 0.9);
  const ub = S.since('brain') - 1.0, lt = ub < 0 ? -1 : ub % LOOP;
  NODES.forEach(function (n, i) {
    let fire = 0;
    if (i < CHAIN && lt >= 0) fire = cl(1 - Math.abs(lt - i * 0.25 - 0.12) / 0.3);
    else if (i >= CHAIN) fire = Math.max(0, Math.sin(T * 1.7 + i * 2.3)) * 0.35;
    if (fire > 0.05) glow(n[0], n[1], 7, C.yellow, fire * 0.8);
    circ(n[0], n[1], 2.3, fire > 0.4 ? C.yellow : '#8A2F6A'); circ(n[0], n[1], 1.1, fire > 0.4 ? C.white : '#C7609C');
  });
  if (lt >= 0 && lt < 1.75) { const pp = along(([] as number[]).concat(...PATH), lt / 1.75); circ(pp[0], pp[1], 1.7, C.white); }
}

/** Drawn inside the network's fade; its own alphas are relative to it. */
function ghostTriesToReachIn(S: BeatState, T: number, bob: number): void {
  const g = S.since('nogap');
  if (g > 0) {
    let gx2: number, gy2: number, ga = 1, mood = '';
    if (g < 1.4) { const e = easeOut(g / 1.4); gx2 = lerp(735, 678, e); gy2 = lerp(240, 276, e); }
    else if (g < 2.4) { const e2 = ease((g - 1.6) / 0.8); gx2 = lerp(678, 646, e2); gy2 = lerp(276, 304, e2); ga = 1 - 0.5 * Math.sin(e2 * PI); }
    else { gx2 = 646; gy2 = 304; mood = 'sad'; ga = 1 - cl((g - 5.2) / 0.6); }
    ghost(gx2, gy2 + bob, 0.13, { t: T, alpha: ga, mood: mood, flip: true });
    const q = g - 2.6;
    if (q > 0 && q < 2.4) {
      A(1 - cl((q - 1.8) / 0.5));
      tf(659, 276 + bob, back(q / 0.4) * 0.16, 0, function () { circ(0, 0, 26, C.red); cross(0, 0, 10, C.white, 6); });
      A(1);
    }
  }
}

const FACULTIES: [IconKind, number, number, string, string][] = [['eye', 318, 400, C.teal, 'perceiving'], ['memory', 420, 256, C.pink, 'remembering'], ['love', 860, 256, C.red, 'wanting'], ['plan', 962, 400, C.purple, 'deciding']];

/** What cognition does. */
function faculties(S: BeatState): void {
  FACULTIES.forEach(function (q, i) {
    const p = S.pop('list', 0.5 + i * 1.0);
    if (p > 0) badge(q[0], q[1], q[2], 44, q[3], { scale: p, label: q[4], ls: 26 });
  });
}
