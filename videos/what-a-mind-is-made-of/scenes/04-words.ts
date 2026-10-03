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
import { speech, type Speech, type Spots } from './shared/speech';
import type { Holds } from './shared/speechTiming';
import type { Scene } from './types';

const GY = 620, HEAD = [505, 350];

/** Questions stay up while you weigh them; answers stay up while the narrator talks about them. */
const HOLDS: Holds = { ask1: 'ans1', ans1: 'stranger', ask2: 'ans2', ans2: null };
const SPOTS: Spots = {
  friend: { x: 212, y: 372, tail: -8, bg: C.cyan, maxW: 300 },
  you: { x: 520, y: 338, size: 32, tail: -10, maxW: 420, dx: -40 }
};

/** When the second weighing starts in "ask2", after the friend's question. */
const ASK2_WEIGH = 0.9;

export const words: Scene = {
  bg: ['#8A2F6B', '#32123F'], accent: C.orange,
  back: function (S, cam, T) { floaters(cam, T, 44, 16, [C.orange, C.pink, C.violet], 0.35); stars(cam, T, 14, 40, 0.15, '#FFD7C0'); },
  draw: function (S, cam, T) {
    const sp = speech(S, HOLDS);
    ground(GY, -900, 2600, '#C0508F', '#5A1F5E');
    speakers(S, T, sp);
    mouthThenChoice(S);
    weighing(S);
    sp.bubbles(SPOTS);
    selected(S);
  }
};

function speakers(S: BeatState, T: number, sp: Speech): void {
  const narrating = S.is('speak') || (S.is('which') && S.bt < 1.2);
  const weighingNow = S.is('weigh') || (S.is('ask2') && S.bt > ASK2_WEIGH);
  const aa = S.on('ask1', -0.6, 0.6), asking = sp.talk('friend') !== undefined;
  bean({ x: lerp(60, 190, aa), y: GY, s: 1.15, t: T, color: C.teal, phase: 3, look: [0.7, -0.1], talk: sp.talk('friend'), armR: asking ? 1.2 : 0.14, alpha: aa });
  bean({ x: 470, y: GY, s: 1.5, t: T, color: C.orange, look: weighingNow ? [0.6, -0.7] : S.has('ask1') ? [-0.7, 0.1] : [0.2, 0], talk: sp.talk('you'), mouth: narrating ? 'talk' : weighingNow ? 'flat' : 'smile', armR: weighingNow ? 2.9 : 0.14 });
}

/** Rejected words: [word, x, y, seconds into "which"]. All sit inside the speak camera's frame (y >= 167 at z 1.5). */
const REJECTED: [string, number, number, number][] = [['that', 660, 230, 1.4], ['those', 700, 300, 2.0], ['these', 790, 226, 2.6]];

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
        const b = tag(q[0], 0, 0, 30, 'rgba(255,255,255,0.85)', C.ink), my = b.y + b.h / 2;
        if (x > 0) line([b.x + 6, my, b.x + 6 + (b.w - 12) * x, my], C.red, 5);
      });
      A(1);
    });
  }
}

/** Cognition weighing the candidates: first coffee/tea, then yes/no. */
function weighing(S: BeatState): void {
  const pa = S.on('weigh', 0.2, 0.5);
  if (pa <= 0) return;
  [[560, 318, 9], [612, 286, 13], [672, 250, 17]].forEach(function (d, i) { A(S.on('weigh', 0.1 + i * 0.12, 0.3) * 0.9); circ(d[0], d[1], d[2], '#3D1657'); });
  A(1);
  const second = S.has('ask2'), x2 = S.on('ask2', ASK2_WEIGH, 0.5), w = ASK2_WEIGH;
  if (!second || x2 < 0.5) {
    const c1 = arr(S, 'weigh', 1.2), c2 = arr(S, 'weigh', 2.2), c3 = arr(S, 'weigh', 3.2);
    panel(pa * (second ? 1 - x2 * 2 : 1), ['coffee', 'tea'], [0.2 + 0.3 * c1 + 0.32 * c3, 0.2 + 0.28 * c2], S.on('weigh', 4.6, 0.4));
    chip(S, 'weigh', 1.2, 'memory', C.pink, 0, 0.35); chip(S, 'weigh', 2.2, 'cup', C.teal, 1, 0.35); chip(S, 'weigh', 3.2, 'clock', C.purple, 0, 0.6);
  } else {
    const d1 = arr(S, 'ask2', w + 0.3), d2 = arr(S, 'ask2', w + 1.2), d3 = arr(S, 'ask2', w + 2.1);
    panel((x2 - 0.5) * 2, ['Yes, obviously.', 'No.'], [0.16 + 0.26 * d1 + 0.26 * d2 + 0.26 * d3, 0.12], S.on('ask2', w + 3.9, 0.4));
    chip(S, 'ask2', w + 0.3, 'self', C.cyan, 0, 0.3); chip(S, 'ask2', w + 1.2, 'memory', C.pink, 0, 0.5); chip(S, 'ask2', w + 2.1, 'language', C.green, 0, 0.75);
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

/** The answer was selected by cognition: an arrow from the panel to the answer bubble. */
function selected(S: BeatState): void {
  const sm = S.on('same', 0.8, 0.7);
  if (sm > 0) {
    A(sm);
    const p0 = [760, 300], p1 = [lerp(760, 690, sm), lerp(300, 262, sm)];
    arrow(p0[0], p0[1], p1[0], p1[1], C.yellow, 8);
    tf(545, 96, back(sm), 0, function () { tag('selected by cognition', 0, 0, 30, C.yellow, C.ink, 700); });
    A(1);
  }
}
