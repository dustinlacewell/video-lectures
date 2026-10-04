/* 3. The body: the arm, traced back into the brain. */

import type { BeatState } from '@studio/engine/beatState';
import { A, c, tf, withA } from '@studio/engine/canvas';
import { circ, cross, ell, glow, line, rr } from '@studio/engine/draw';
import { TAU, back, cl, ease, easeOut, lerp } from '@studio/engine/math';
import { C } from '@studio/engine/palette';
import { tag } from '@studio/engine/text';
import type { Cam } from '@studio/engine/script';
import { bean } from '@studio/library/characters/bean';
import { badge, type IconKind } from '@studio/library/props/icons';
import { along, flow, floaters, ground, stars } from '@studio/library/backgrounds/scenery';
import { spirit } from '../kit/spirits';
import { CHAIN, LOOP } from './03-body.layout';
import { BR, EDGES, NODES, PATH, TRACE, TRACE_BADGE, activity, type Pt } from './03-body.network';
import type { Scene } from '@studio/engine/scene';

const BX = 640, BY = 650, BS = 2.3;
const PATH_FLAT = ([] as number[]).concat(...PATH);

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
    /* the labels leave as the camera dives into the brain, before they reach the frame edge */
    withA(1 - S.on('brain', 0.5, 0.4), function () {
      const mt = S.pop('muscle', 2.0);
      if (mt > 0) tf(mx + 96, my + 6, mt, 0, function () { tag('muscle shortens', 0, 0, 17, C.cream, C.ink); });
      const nt = S.pop('muscle', 4.4);
      if (nt > 0) tf(650, 392 + bob, nt, 0, function () { tag('nerve fires', 0, 0, 17, C.yellow, C.ink); });
    });
    /* signal dots keep a steady screen size as the camera dives into the brain */
    if (sm > 4.3) flow(nerve, T, 90, 34, 4 * Math.min(1, 2.2 / cam.z), C.white);
  });
}

/** Inside the brain: the always-busy network, the chain we follow, the trace back, and a spirit that cannot get in. */
function insideBrain(S: BeatState, cam: Cam, T: number, bob: number): void {
  const net = cl((cam.z - 3.2) / 1.6);
  if (net > 0) withA(net, function () {
    c.save(); c.translate(0, bob);
    network(S, T);
    traceBack(S);
    spiritTriesToReachIn(S, T);
    c.restore();
  });
}

/** Seconds into the current loop of the chain, or -1 before it starts. */
function chainClock(S: BeatState): number {
  const ub = S.since('brain') - 1.0;
  return ub < 0 ? -1 : ub % LOOP;
}

/** Background pulses everywhere, always; the chain drawn brighter and thicker on top. */
function network(S: BeatState, T: number): void {
  const act = activity(T), lt = chainClock(S), hi = S.on('brain', 0.2, 0.8);
  EDGES.forEach(function (e) { line([NODES[e[0]][0], NODES[e[0]][1], NODES[e[1]][0], NODES[e[1]][1]], 'rgba(120,40,90,0.35)', 0.6); });
  line(PATH_FLAT, 'rgba(120,40,90,0.7)', 1.4);
  A(hi * 0.55); line(PATH_FLAT, C.yellow, 1.1); A(1);
  act.pulses.forEach(function (p) { A(p.a * 0.8); circ(p.x, p.y, 0.9, '#FFE7A0'); });
  A(1);
  NODES.forEach(function (n, i) {
    const fire = i < CHAIN && lt >= 0 ? cl(1 - Math.abs(lt - i * 0.25 - 0.12) / 0.3) : 0, fl = act.flash[i];
    if (fire > 0.05) glow(n[0], n[1], 8, C.yellow, fire * 0.9);
    else if (fl > 0.05) glow(n[0], n[1], 4.5, C.yellow, fl * 0.45);
    neuron(n, i < CHAIN ? 2.5 : 2.1, fire > 0.4 ? 2 : fl > 0.5 ? 1 : 0);
  });
  if (lt >= 0 && lt < 1.75) { const pp = along(PATH_FLAT, lt / 1.75); glow(pp[0], pp[1], 5, C.white, 0.7); circ(pp[0], pp[1], 2.0, C.white); }
}

const NEURON_COLORS = [['#8A2F6A', '#C7609C'], ['#B04A85', '#FFC6E0'], [C.yellow, C.white]];

/** A neuron: 0 at rest, 1 flickering in the background, 2 firing in the chain. */
function neuron(n: Pt, r: number, lit: number): void {
  circ(n[0], n[1], r, NEURON_COLORS[lit][0]); circ(n[0], n[1], r * 0.48, NEURON_COLORS[lit][1]);
}

/** What you saw, learned, wanted: one neuron each, the trace hopping back from the chain through all three. */
const TRACE_TAGS: [IconKind, string, number][] = [['eye', C.teal, 0.6], ['book', C.purple, 2.0], ['love', C.red, 3.4]];

function traceBack(S: BeatState): void {
  TRACE.forEach(function (to, i) {
    const from = i ? TRACE[i - 1] : PATH[0], q = TRACE_TAGS[i];
    const grow = S.on('trace', q[2] - 0.5, 0.5);
    if (grow <= 0) return;
    const x = lerp(from[0], to[0], grow), y = lerp(from[1], to[1], grow);
    line([from[0], from[1], x, y], C.yellow, 0.9, [2, 2]);
    if (grow < 1) circ(x, y, 1.6, C.white);
    const p = S.pop('trace', q[2]);
    if (p <= 0) return;
    glow(to[0], to[1], 8, C.yellow, 0.8 * cl(p));
    neuron(to, 2.5, 2);
    badge(q[0], TRACE_BADGE[i][0], TRACE_BADGE[i][1], 7, q[1], { scale: p });
  });
}

/** Where the spirit pushes at the chain: the middle of its last link, nearest the outside. */
const CONTACT: Pt = [683, 293];

/** Drawn inside the network's fade; its own alphas are relative to it. */
function spiritTriesToReachIn(S: BeatState, T: number): void {
  const g = S.since('nogap');
  if (g <= 0) return;
  const p = spiritAt(g);
  spirit(p[0], p[1], 0.12, { t: T, alpha: 1 - S.on('name', 0, 0.6), mood: g > 2.6 ? 'sad' : '', rot: p[2] });
  const q = g - 2.6;
  if (q > 0) withA(1 - cl((q - 1.8) / 0.5), function () {
    tf(CONTACT[0], CONTACT[1], back(q / 0.4) * 0.16, 0, function () { circ(0, 0, 26, C.red); cross(0, 0, 10, C.white, 6); });
  });
}

/** Spirit [x, y, tilt] at g seconds into "nogap": float in, lunge at the chain, bounce off. Anchored to beat start; holds after. */
function spiritAt(g: number): [number, number, number] {
  const hover: Pt = [716, 262], touch: Pt = [692, 284], rest: Pt = [714, 264];
  if (g < 1.4) { const e = easeOut(g / 1.4); return [lerp(758, hover[0], e), lerp(232, hover[1], e), 0]; }
  if (g < 2.6) { const e = ease((g - 1.6) / 1.0); return [lerp(hover[0], touch[0], e), lerp(hover[1], touch[1], e), -0.35 * e]; }
  const e = easeOut((g - 2.6) / 0.7), shake = Math.sin(g * 45) * 1.2 * (1 - e);
  return [lerp(touch[0], rest[0], e) + shake, lerp(touch[1], rest[1], e), -0.35 * (1 - e)];
}

const FACULTIES: [IconKind, number, number, string, string][] = [['eye', 318, 400, C.teal, 'perceiving'], ['memory', 420, 256, C.pink, 'remembering'], ['love', 860, 256, C.red, 'wanting'], ['plan', 962, 400, C.purple, 'deciding']];

/** What cognition does. */
function faculties(S: BeatState): void {
  FACULTIES.forEach(function (q, i) {
    const p = S.pop('list', 0.5 + i * 1.0);
    if (p > 0) badge(q[0], q[1], q[2], 44, q[3], { scale: p, label: q[4], ls: 26 });
  });
}
