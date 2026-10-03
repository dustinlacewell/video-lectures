/* 8. Animals and AI: consciousness is trivia, cognition is what matters. Ends on the title art. */

import type { BeatState } from '../engine/beatState';
import { A, c, tf } from '../engine/canvas';
import { bgGradient, circ, fillRR, glow, line, poly, ring, strokeRR } from '../engine/draw';
import { PI, cl, easeIn, easeOut, lerp } from '../engine/math';
import { C } from '../engine/palette';
import { withCam } from '../engine/parallax';
import { tag, txt } from '../engine/text';
import { aibot } from '../kit/aibot';
import { crow, dog, octopus, type Creature } from '../kit/animals';
import { bean } from '../kit/bean';
import { badge, icon, type IconKind } from '../kit/icons';
import { ground, stars } from '../kit/scenery';
import { spark } from '../kit/spark';
import { TITLE_BG, titleBack, titleScene } from './shared/titleArt';
import type { Scene } from './types';

const GY = 620;

interface Being { x: number; fn: Creature | null; s: number; top: number; b: [IconKind, string][] }

/** Crow, dog, octopus, a person (fn null), and an AI, each with its faculties. */
const WHO: Being[] = [
  { x: 300, fn: crow, s: 1.15, top: 250, b: [['tool', '#E8742A'], ['plan', '#7A55D6'], ['memory', '#FF5C8A']] },
  { x: 600, fn: dog, s: 1.15, top: 250, b: [['love', '#F0435E'], ['memory', '#FF5C8A'], ['fear', '#9B5BD6']] },
  { x: 900, fn: octopus, s: 1.15, top: 250, b: [['puzzle', '#12A99A'], ['eye', '#3E7BFA'], ['plan', '#7A55D6']] },
  { x: 1210, fn: null, s: 1.3, top: 250, b: [['memory', '#FF5C8A'], ['love', '#F0435E'], ['plan', '#7A55D6'], ['talent', '#2FA85A'], ['belief', '#3E7BFA'], ['humor', '#E8742A']] },
  { x: 1520, fn: aibot, s: 1.2, top: 250, b: [['language', '#2FA85A'], ['memory', '#FF5C8A'], ['plan', '#7A55D6']] }
];
const PERSON = 3;

export const animals: Scene = {
  bg: ['#3A2E86', '#D9627A'], accent: C.yellow,
  back: function (S, cam, T) {
    if (S.has('end')) { bgGradient(TITLE_BG[0], TITLE_BG[1]); titleBack(cam, T); return; }
    stars(cam, T, 81, 60, 0.12, '#FFE9C8');
    withCam(cam, 0.2, function () { glow(700, 540, 520, '#FFD27A', 0.5); circ(700, 540, 150, '#FFD98A'); });
    withCam(cam, 0.45, hills);
  },
  draw: function (S, cam, T) {
    if (S.has('end')) { titleScene(T, 'Cognition is what matters'); return; }
    ground(GY, -1200, 3400, '#F0906E', '#7A3060');
    const hopT = [S.since('three') - 0.4, S.since('three') - 2.8, S.since('three') - 5.2, -1, S.since('ai') - 1.0];
    const why = S.since('why');
    WHO.forEach(function (w, i) {
      const lift = hop(hopT[i]) + (why > 0 ? hop(why - 0.6 - i * 0.5) : 0);
      const sl = slots(w), web = S.on('matters', 0.4 + i * 0.15, 0.6);
      facultyWeb(sl, web);
      faculties(S, T, w, i, sl, web);
      if (w.fn) w.fn(w.x, GY, w.s, T, lift);
      else bean({ x: w.x, y: GY, s: w.s, t: T, color: C.orange, lift: lift, look: [0.5, -0.3], mouth: 'smile' });
      if (i !== PERSON) consciousQuestion(S, T, w, i, why);
      selfModel(S, w, i);
    });
  },
  over: function (S) {
    const a = 1 - S.on('claim', 0, 0.3), p1 = S.pop('matters', 0.6), p2 = S.pop('matters', 3.0);
    if (a <= 0) return;
    c.globalAlpha = a;
    if (p1 > 0) tf(640, 66, p1, 0, function () { tag('How sophisticated is the cognition?', 0, 0, 36, C.yellow, C.ink, 700); });
    if (p2 > 0) tf(640, 134, p2, 0, function () { tag('How richly does it model itself?', 0, 0, 36, C.cream, C.ink, 700); });
    c.globalAlpha = 1;
  }
};

function hills(): void {
  c.fillStyle = 'rgba(90,30,90,0.45)';
  c.beginPath(); c.moveTo(-600, 660); c.quadraticCurveTo(100, 420, 700, 580); c.quadraticCurveTo(1200, 430, 2000, 600); c.quadraticCurveTo(2400, 520, 2800, 660); c.closePath(); c.fill();
}

/** Badge positions above a being: a triangle of three, or two rows of three. */
function slots(w: Being): number[][] {
  const n = w.b.length;
  let out: number[][] = [];
  if (n === 3) out = [[w.x, 300], [w.x - 84, 352], [w.x + 84, 352]];
  else for (let i = 0; i < n; i++) out.push([w.x + (i % 3 - 1) * 84, 268 + Math.floor(i / 3) * 84 + (i % 3 === 1 ? -30 : 0)]);
  return out;
}

function hop(u: number): number { return u > 0 && u < 0.6 ? Math.sin(u / 0.6 * PI) * 46 : 0; }

/** The web between this being's faculties: how sophisticated the cognition is. */
function facultyWeb(sl: number[][], web: number): void {
  if (web > 0) {
    A(web * 0.8);
    for (let a = 0; a < sl.length; a++) for (let b = a + 1; b < sl.length; b++) line([sl[a][0], sl[a][1], sl[b][0], sl[b][1]], C.yellow, 3);
    A(1);
  }
}

function faculties(S: BeatState, T: number, w: Being, i: number, sl: number[][], web: number): void {
  w.b.forEach(function (bd, k) {
    let p: number;
    if (i < PERSON) p = k === 0 ? S.pop('three', 0.4 + i * 2.4) : S.pop('are', 0.4 + (i * 2 + k - 1) * 0.3);
    else if (i === PERSON) p = S.pop('are', 2.4 + k * 0.15);
    else p = S.pop('ai', 1.6 + k * 0.6);
    if (p > 0) badge(bd[0], sl[k][0], sl[k][1], 34, bd[1], { scale: p * (1 + 0.08 * web * Math.sin(T * 4 + k)) });
  });
}

/** "Is it conscious?" bubble, stamped TRIVIA, then dropped. */
function consciousQuestion(S: BeatState, T: number, w: Being, i: number, why: number): void {
  const k2 = i > PERSON ? PERSON : i, qp = S.pop('ask', 0.9 + k2 * 0.4), drop = why > 0 ? easeIn(cl((why - 0.2 - k2 * 0.12) / 0.6)) : 0;
  if (qp > 0 && drop < 1) {
    A(1 - drop);
    tf(w.x, 150 + drop * 220, qp, drop * 0.5, function () {
      fillRR(-92, -48, 184, 96, 30, C.white); poly([-14, 46, 14, 46, 0, 70], C.white);
      spark(-40, 0, 24, false, T); txt('?', 34, 4, 70, C.ink, 'center', 700);
      const st = S.since('trivia') - 0.5 - k2 * 0.5;
      if (st > 0) tf(0, 0, lerp(2.6, 1, easeOut(st / 0.18)), -0.2, function () {
        A((1 - drop) * cl(st / 0.1)); strokeRR(-108, -34, 216, 68, 10, C.red, 8); fillRR(-100, -26, 200, 52, 6, 'rgba(255,255,255,0.86)'); txt('TRIVIA', 0, 3, 50, C.red, 'center', 700);
      });
    });
    A(1);
  }
}

/** How richly does it model itself? Only the person gets a full self-model badge. */
function selfModel(S: BeatState, w: Being, i: number): void {
  const sm = S.pop('matters', 3.0 + i * 0.22);
  if (sm > 0) tf(w.x, 176, sm, 0, function () {
    if (i === PERSON) badge('self', 0, 0, 40, '#12A99A');
    else { ring(0, 0, 40, C.cream, 4, [9, 8]); A(0.75); c.save(); c.scale(40 / 54, 40 / 54); icon('self', '#12A99A'); c.restore(); A(1); }
  });
}
