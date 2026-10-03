/* 6. The inventory: what makes you you, and the zombie has every item too. */

import type { BeatState } from '../engine/beatState';
import { A, tf } from '../engine/canvas';
import { arrow, ell, line } from '../engine/draw';
import { PI, back, lerp } from '../engine/math';
import { C } from '../engine/palette';
import { tag } from '../engine/text';
import { bean } from '../kit/bean';
import { badge } from '../kit/icons';
import { floaters, ground, stars } from '../kit/scenery';
import { spark } from '../kit/spark';
import { GY, INV, ZC, invPos } from './06-inventory.layout';
import { thoughtTag } from './shared/thoughtTag';
import type { Scene } from './types';

/** When each of your items pops in: [beat, seconds]. */
const TIMES: [string, number][] = [['m1', 0.3], ['m1', 1.9], ['m1', 3.5], ['m2', 0.3], ['m2', 1.9], ['m2', 3.5], ['m3', 0.3], ['m3', 2.6]];

export const inventory: Scene = {
  bg: ['#2F46A0', '#151A52'], accent: C.yellow,
  back: function (S, cam, T) { stars(cam, T, 61, 110, 0.2); floaters(cam, T, 62, 14, [C.yellow, C.cyan, C.pink], 0.4); },
  draw: function (S, cam, T) {
    ground(GY, -900, 3600, '#4F68D6', '#232C7A');
    const cg = S.on('cog', 0.5, 0.8);
    [640, ZC].forEach(function (cx) { figureWithItems(S, T, cx, cg); });
    cognitionLabel(S, T, cg);
    whyZombieHasItAll(S);
    nameTags(S);
  },
  over: function (S) { thoughtTag(S); }
};

function figureWithItems(S: BeatState, T: number, cx: number, cg: number): void {
  const z = cx === ZC;
  let pulse = [-1, -1, -1];
  if (z) pulse = [S.since('zlife') - 0.5, S.since('zlife') - 3.0, S.since('zlife') - 5.4];
  INV.forEach(function (it, k) {
    const p = z ? S.pop('zall', 0.3 + k * 0.32) : S.pop(TIMES[k][0], TIMES[k][1]);
    if (p <= 0) return;
    const pos = invPos(cx, k), link = z ? S.on('zall', 3.2, 0.6) : cg;
    if (link > 0) { A(link * 0.55); line([pos[0], pos[1], lerp(pos[0], cx, link * 0.86), lerp(pos[1], 440, link * 0.86)], C.yellow, 3, [8, 8]); A(1); }
    let pu = 1;
    const which = k === 4 ? 0 : k === 2 ? 1 : k === 6 ? 2 : -1;
    if (z && which >= 0 && pulse[which] > 0 && pulse[which] < 1.2) pu = 1 + 0.3 * Math.sin(pulse[which] / 1.2 * PI);
    badge(it[0], pos[0], pos[1], 46, it[2], { scale: p * pu, label: it[1], ls: 27 });
  });
  const grin = z ? S.has('zlife') : S.has('m1');
  bean({ x: cx, y: GY, s: 1.4, t: T, color: C.orange, phase: z ? 0.5 : 0, mouth: grin ? 'grin' : 'smile', look: [Math.sin(T * 0.7) * 0.6, -0.5], armR: z && S.has('zlife') ? 2.4 + Math.sin(T * 5) * 0.2 : 0.14 });
  spark(cx, 348, 20, !z, T);
}

function cognitionLabel(S: BeatState, T: number, cg: number): void {
  if (cg > 0) {
    A(cg);
    ell(640, GY - 232 + Math.sin(T * 2.1) * 3, 38, 17, '#FF9DBB');
    tf(640, 286, back((S.since('cog') - 1.4) / 0.5), 0, function () { tag('COGNITION', 0, 0, 42, C.yellow, C.ink, 700); });
    A(1);
  }
}

const WHY: [string, number, string, number][] = [['no inner experience', ZC - 400, C.grey, 0.4], ['physically identical', ZC, C.cream, 2.6], ['same cognition', ZC + 392, C.yellow, 5.0]];

function whyZombieHasItAll(S: BeatState): void {
  const wa = 1 - S.on('zall', 0, 0.4);
  if (wa > 0) WHY.forEach(function (q, i) {
    const p = S.pop('zwhy', q[3]);
    if (p <= 0) return;
    A(wa);
    if (i > 0) arrow(q[1] - 232, 250, q[1] - 176 - (i === 2 ? -12 : 0), 250, C.cream, 6);
    tf(q[1], 250, p, 0, function () { tag(q[0], 0, 0, 30, q[2], C.ink, 700); });
    A(1);
  });
}

function nameTags(S: BeatState): void {
  const zt = S.on('z', 0.6, 0.4);
  if (zt > 0) { A(zt); tag('ZOMBIE', ZC + 150, GY - 44, 28, C.green, C.ink, 700); }
  A(S.on('you', 0.5, 0.4));
  tag('YOU', 640 - 130, GY - 44, 28, C.cream, C.ink, 700);
  A(1);
}
