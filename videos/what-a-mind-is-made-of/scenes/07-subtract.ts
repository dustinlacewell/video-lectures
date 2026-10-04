/* 7. Two subtractions: remove experience (still you), remove cognition (no one). */

import type { BeatState } from '@studio/engine/beatState';
import { A, tf } from '@studio/engine/canvas';
import { check, circ, ring } from '@studio/engine/draw';
import { TAU, cl, easeIn, easeOut, mix } from '@studio/engine/math';
import { C } from '@studio/engine/palette';
import { tag } from '@studio/engine/text';
import { bean } from '@studio/library/characters/bean';
import { badge } from '@studio/library/props/icons';
import { floaters, ground, stars } from '@studio/library/backgrounds/scenery';
import { spark } from '@studio/library/props/spark';
import { GY, INV, ZC, invPos } from './06-inventory.layout';
import { CHECK_STEP, REM } from './07-subtract.layout';
import { thoughtTag } from './shared/thoughtTag';
import type { Scene } from '@studio/engine/scene';

const GREY = '#8D89A8';

export const subtract: Scene = {
  bg: ['#7A3348', '#2A1336'], accent: C.pink,
  back: function (S, cam, T) { stars(cam, T, 71, 90, 0.2, '#FFD9E4'); floaters(cam, T, 72, 14, [C.pink, C.orange, C.violet], 0.4); },
  draw: function (S, cam, T) {
    ground(GY, -900, 3600, '#B5516A', '#4E1E46');
    minusExperience(S, T);
    minusCognition(S, T);
  },
  over: function (S) { thoughtTag(S); }
};

/** Subtraction 1: remove the spark; every item stays and gets a check. */
function minusExperience(S: BeatState, T: number): void {
  const gone = S.since('s1a') - 2.2;
  INV.forEach(function (it, k) {
    const pos = invPos(640, k);
    badge(it[0], pos[0], pos[1], 46, it[2], { label: it[1], ls: 27 });
    const ck = S.pop('s1b', 0.5 + k * CHECK_STEP);
    if (ck > 0) tf(pos[0] + 34, pos[1] - 34, ck, 0, function () { circ(0, 0, 17, C.green); check(0, 0, 15, C.white, 4.5); });
  });
  bean({ x: 640, y: GY, s: 1.4, t: T, color: C.orange, mouth: S.has('s1b') ? 'grin' : 'smile', look: gone > 0 && gone < 1.5 ? [0, -1] : [Math.sin(T * 0.7) * 0.6, -0.4], armR: S.has('s1b') ? 2.4 + Math.sin(T * 5) * 0.2 : 0.14 });
  if (gone < 0) spark(640, 348, 20, true, T);
  else {
    spark(640, 348, 20, false, T);
    if (gone < 0.7) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, d = easeOut(gone / 0.7) * 80; A(1 - gone / 0.7); circ(640 + Math.cos(a) * d, 348 + Math.sin(a) * d, 5, C.yellow); }
    A(1);
  }
  const t1 = S.pop('s1a', 0.5);
  if (t1 > 0) tf(640, 288, t1, 0, function () { tag('minus inner experience', 0, 0, 29, C.pink, C.white, 700); });
  const zt = S.pop('s1b', 0.3);
  if (zt > 0) tf(640 + 150, GY - 44, zt, 0, function () { tag('= ZOMBIE', 0, 0, 28, C.green, C.ink, 700); });
}

/** Subtraction 2: items fall away one by one; the figure greys out and goes blank. */
function minusCognition(S: BeatState, T: number): void {
  const sb = S.since('s2b');
  let removed = 0;
  INV.forEach(function (it, k) {
    let at = 0;
    for (let i = 0; i < REM.length; i++) if (REM[i][0] === k) at = REM[i][1];
    const u = cl((sb - at) / 0.4), pos = invPos(ZC, k);
    if (sb > at) removed++;
    if (u >= 1) { A(0.5); ring(pos[0], pos[1], 44, 'rgba(255,255,255,0.3)', 3, [8, 8]); A(1); return; }
    A(1 - u); badge(it[0], pos[0], pos[1] + easeIn(u) * 70, 46, u > 0 ? GREY : it[2], { scale: 1 - u * 0.4, label: it[1], ls: 27, rot: u * 0.6 }); A(1);
  });
  const fr = removed / 8, empty = fr >= 1;
  bean({ x: ZC, y: GY, s: 1.4, t: T, color: mix(C.orange, GREY, fr), phase: 1, mouth: fr > 0.4 ? 'flat' : 'smile', blank: empty, look: empty ? [0, 0] : [Math.sin(T * 0.7) * 0.6, -0.4], still: empty });
  spark(ZC, 348, S.has('s2c') ? 24 : 20, true, T);
  const t2 = S.pop('s2a', 1.8) * (1 - S.on('s2c', 0, 0.4));
  if (t2 > 0) tf(ZC, 288, t2, 0, function () { tag('minus cognition', 0, 0, 29, C.pink, C.white, 700); });
}
