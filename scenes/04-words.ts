/* 4. Words: why this word and not that one. Cognition weighs candidates; the answer is selected. */

import type { BeatState } from '../engine/beatState';
import { A, tf, withA } from '../engine/canvas';
import { arrow, check, circ, fillRR, line, strokeRR } from '../engine/draw';
import { PI, back, ease, lerp } from '../engine/math';
import { C } from '../engine/palette';
import { bubble, tag, txt } from '../engine/text';
import { bean } from '../kit/bean';
import { badge, type IconKind } from '../kit/icons';
import { floaters, ground, stars } from '../kit/scenery';
import type { Scene } from './types';

const GY = 620, HEAD = [505, 350];

export const words: Scene = {
  bg: ['#8A2F6B', '#32123F'], accent: C.orange,
  back: function (S, cam, T) { floaters(cam, T, 44, 16, [C.orange, C.pink, C.violet], 0.35); stars(cam, T, 14, 40, 0.15, '#FFD7C0'); },
  draw: function (S, cam, T) {
    ground(GY, -900, 2600, '#C0508F', '#5A1F5E');
    speakers(S, T);
    mouthThenChoice(S);
    questions(S);
    weighing(S);
    answers(S);
  }
};

function speakers(S: BeatState, T: number): void {
  const talkYou = (S.is('speak')) || (S.is('which') && S.bt < 1.2) || (S.is('ans1') && S.bt < 1.4) || (S.is('ans2') && S.bt < 3.4);
  const talkAsk = (S.is('ask1') && S.bt < 1.6) || (S.is('ask2') && S.bt < 1.8);
  const weighingNow = S.is('weigh') || (S.is('ask2') && S.bt > 2.0);
  const aa = S.on('ask1', -0.6, 0.6);
  bean({ x: lerp(60, 190, aa), y: GY, s: 1.15, t: T, color: C.teal, phase: 3, look: [0.7, -0.1], mouth: talkAsk ? 'talk' : 'smile', armR: talkAsk ? 1.2 : 0.14, alpha: aa });
  bean({ x: 470, y: GY, s: 1.5, t: T, color: C.orange, look: weighingNow ? [0.6, -0.7] : S.has('ask1') ? [-0.7, 0.1] : [0.2, 0], mouth: talkYou ? 'talk' : weighingNow ? 'flat' : 'smile', armR: weighingNow ? 2.9 : 0.14 });
}

const REJECTED: [string, number, number, number][] = [['that', 660, 230, 1.4], ['those', 700, 300, 2.0], ['these', 640, 160, 2.6]];

/** The moving mouth, then the choice of words. */
function mouthThenChoice(S: BeatState): void {
  const b0 = S.pop('speak', 0.4) * (1 - S.on('which', 0, 0.3));
  if (b0 > 0) bubble('words words words', 520, 338, 30, { scale: b0, tail: -10 });
  const b1 = S.pop('which', 0.4) * (1 - S.on('ask1', 0, 0.3));
  if (b1 > 0) {
    bubble('this', 520, 338, 44, { scale: b1, tail: -10, bg: C.yellow });
    REJECTED.forEach(function (q) {
      const p = S.pop('which', q[3] - 0.9), x = S.on('which', q[3], 0.3);
      if (p <= 0) return;
      A(b1 * lerp(0.9, 0.4, x));
      tf(q[1], q[2], p, 0, function () {
        const w = tag(q[0], 0, 0, 30, 'rgba(255,255,255,0.85)', C.ink);
        if (x > 0) line([-w / 2 + 6, 0, -w / 2 + 6 + (w - 12) * x, 0], C.red, 5);
      });
      A(1);
    });
  }
}

function questions(S: BeatState): void {
  const q1 = S.pop('ask1', 0.3) * (1 - S.on('ans1', 0, 0.3));
  if (q1 > 0) bubble('Coffee or tea?', 212, 372, 30, { scale: q1, tail: -8, bg: C.cyan });
  const q2 = S.pop('ask2', 0.4) * (1 - S.on('same', 0, 0.4));
  if (q2 > 0) bubble('Are you conscious?', 212, 372, 30, { scale: q2, tail: -8, bg: C.cyan, maxW: 300 });
}

/** Cognition weighing the candidates: first coffee/tea, then yes/no. */
function weighing(S: BeatState): void {
  const pa = S.on('weigh', 0.2, 0.5);
  if (pa <= 0) return;
  [[560, 318, 9], [612, 286, 13], [672, 250, 17]].forEach(function (d, i) { A(S.on('weigh', 0.1 + i * 0.12, 0.3) * 0.9); circ(d[0], d[1], d[2], '#3D1657'); });
  A(1);
  const second = S.has('ask2'), x2 = S.on('ask2', 1.2, 0.5);
  if (!second || x2 < 0.5) {
    const c1 = arr(S, 'weigh', 1.2), c2 = arr(S, 'weigh', 2.2), c3 = arr(S, 'weigh', 3.2);
    panel(pa * (second ? 1 - x2 * 2 : 1), ['coffee', 'tea'], [0.2 + 0.3 * c1 + 0.32 * c3, 0.2 + 0.28 * c2], S.on('weigh', 4.6, 0.4));
    chip(S, 'weigh', 1.2, 'memory', C.pink, 0, 0.35); chip(S, 'weigh', 2.2, 'cup', C.teal, 1, 0.35); chip(S, 'weigh', 3.2, 'clock', C.purple, 0, 0.6);
  } else {
    const d1 = arr(S, 'ask2', 2.4), d2 = arr(S, 'ask2', 3.3), d3 = arr(S, 'ask2', 4.2);
    panel((x2 - 0.5) * 2, ['Yes, obviously.', 'No.'], [0.16 + 0.26 * d1 + 0.26 * d2 + 0.26 * d3, 0.12], S.on('ask2', 5.7, 0.4));
    chip(S, 'ask2', 2.4, 'self', C.cyan, 0, 0.3); chip(S, 'ask2', 3.3, 'memory', C.pink, 0, 0.5); chip(S, 'ask2', 4.2, 'language', C.green, 0, 0.75);
  }
}

/** The cognition panel: two candidate answers with support bars; `win` marks the first as chosen. */
function panel(a: number, rows: string[], vals: number[], win: number): void {
  if (a <= 0) return;
  withA(a, function () {
    fillRR(730, 128, 480, 352, 30, 'rgba(0,0,0,0.25)'); fillRR(730, 120, 480, 352, 30, '#3D1657'); strokeRR(742, 132, 456, 328, 20, 'rgba(255,255,255,0.14)', 3);
    tag('cognition', 836, 122, 30, C.orange, C.ink, 700);
    rows.forEach(function (r, i) {
      const y = 218 + i * 126, w = win > 0 && i === 0, lose = win > 0 && i === 1;
      A(lose ? lerp(1, 0.45, win) : 1);
      txt(r, 766, y, 40, w ? C.yellow : C.cream, 'left', 600);
      fillRR(766, y + 34, 408, 22, 11, 'rgba(255,255,255,0.13)');
      fillRR(766, y + 34, Math.max(22, 408 * vals[i]), 22, 11, w ? C.yellow : C.teal);
    });
    A(1);
    if (win > 0) tf(1160, 218, back(win), 0, function () { circ(0, 0, 24, C.green); check(0, 0, 22, C.white, 6); });
  });
}

/** A reason flying from the head into a bar. */
function chip(S: BeatState, id: string, at: number, kind: IconKind, col: string, row: number, frac: number): void {
  const u = (S.since(id) - at) / 0.75;
  if (u <= 0 || u >= 1) return;
  const e = ease(u), x = lerp(HEAD[0], 766 + 408 * frac, e), y = lerp(HEAD[1], 218 + row * 126 + 45, e) - Math.sin(e * PI) * 90;
  badge(kind, x, y, 26, col, { scale: lerp(1, 0.6, e) });
}

/** 0..1 once a chip launched at `at` has arrived. */
function arr(S: BeatState, id: string, at: number): number { return ease((S.since(id) - at - 0.75) / 0.3); }

function answers(S: BeatState): void {
  const a1 = S.pop('ans1', 0.3) * (1 - S.on('ask2', 0, 0.3));
  if (a1 > 0) bubble('Coffee.', 520, 338, 40, { scale: a1, tail: -10 });
  const a2 = S.pop('ans2', 0.3);
  if (a2 > 0) bubble('Yes. Obviously. I am experiencing this right now.', 520, 338, 32, { scale: a2, tail: -10, maxW: 330, dx: -40 });
  const sm = S.on('same', 0.8, 0.7);
  if (sm > 0) {
    A(sm);
    const p0 = [760, 300], p1 = [lerp(760, 690, sm), lerp(300, 262, sm)];
    arrow(p0[0], p0[1], p1[0], p1[1], C.yellow, 8);
    tf(545, 96, back(sm), 0, function () { tag('selected by cognition', 0, 0, 30, C.yellow, C.ink, 700); });
    A(1);
  }
}
