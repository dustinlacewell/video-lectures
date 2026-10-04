/* 8. Animals and AI: consciousness is trivia, cognition is what matters. Ends on the title art. */

import type { BeatState } from '@studio/engine/beatState';
import { A, c, tf } from '@studio/engine/canvas';
import { bgGradient, check, circ, fillRR, glow, line, poly, ring, rr, strokeRR } from '@studio/engine/draw';
import { PI, cl, easeIn, easeOut, lerp } from '@studio/engine/math';
import { C } from '@studio/engine/palette';
import { withCam } from '@studio/engine/parallax';
import { tag, txt } from '@studio/engine/text';
import { aibot } from '../kit/aibot';
import { crow, dog, octopus, type Creature } from '../kit/animals';
import { bean } from '@studio/library/characters/bean';
import { badge, icon, type IconKind } from '@studio/library/props/icons';
import { ground, stars } from '@studio/library/backgrounds/scenery';
import { spark } from '@studio/library/props/spark';
import { TITLE_BG, titleBack, titleScene } from './shared/titleArt';
import type { Scene } from '@studio/engine/scene';

const GY = 620;

/** `knowsSelf`: the being clearly models itself (a dog knows its body, a crow grooms, an octopus never tangles itself). */
interface Being { x: number; fn: Creature | null; s: number; b: [IconKind, string][]; knowsSelf: boolean }

/** Crow, dog, octopus, a person (fn null), and an AI, each with its faculties. */
const WHO: Being[] = [
  { x: 300, fn: crow, s: 1.15, b: [['tool', '#E8742A'], ['plan', '#7A55D6'], ['memory', '#FF5C8A']], knowsSelf: true },
  { x: 600, fn: dog, s: 1.15, b: [['love', '#F0435E'], ['memory', '#FF5C8A'], ['fear', '#9B5BD6']], knowsSelf: true },
  { x: 900, fn: octopus, s: 1.15, b: [['puzzle', '#12A99A'], ['eye', '#3E7BFA'], ['plan', '#7A55D6']], knowsSelf: true },
  { x: 1210, fn: null, s: 1.3, b: [['memory', '#FF5C8A'], ['love', '#F0435E'], ['plan', '#7A55D6'], ['talent', '#2FA85A'], ['belief', '#3E7BFA'], ['humor', '#E8742A']], knowsSelf: true },
  { x: 1520, fn: aibot, s: 1.2, b: [['language', '#2FA85A'], ['memory', '#FF5C8A'], ['plan', '#7A55D6']], knowsSelf: false }
];
const PERSON = 3;
/** When crow, dog and octopus are named in "three"; matches sfx in script/08-animals.ts. */
const INTRO_AT = [0.4, 1.5, 2.6];
/** Height of the consciousness star and the question bubbles. */
const STAR_Y = 150;
/** "trivia" lands about this far into its line; one stamp per being, left to right. */
const STAMP_AT = 2.4, STAMP_GAP = 0.3;

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
    const hopT = [S.since('three') - INTRO_AT[0], S.since('three') - INTRO_AT[1], S.since('three') - INTRO_AT[2], -1, S.since('ai') - 1.0];
    const why = S.since('why');
    WHO.forEach(function (w, i) {
      const lift = hop(hopT[i]) + (why > 0 ? hop(why - 0.6 - i * 0.5) : 0);
      const sl = slots(w), web = S.on('matters', 0.4 + i * 0.15, 0.6);
      facultyWeb(sl, web);
      faculties(S, T, w, i, sl, web);
      if (w.fn) w.fn(w.x, GY, w.s, T, lift);
      else bean({ x: w.x, y: GY, s: w.s, t: T, color: C.orange, lift: lift, look: [0.5, -0.3], mouth: 'smile' });
      consciousStar(S, T, w, i, why);
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
    if (i < PERSON) p = k === 0 ? S.pop('three', INTRO_AT[i]) :S.pop('are', 0.4 + (i * 2 + k - 1) * 0.3);
    else if (i === PERSON) p = S.pop('ai', 0.9 + k * 0.12);
    else p = S.pop('ai', 1.6 + k * 0.6);
    if (p > 0) badge(bd[0], sl[k][0], sl[k][1], 34, bd[1], { scale: p * (1 + 0.08 * web * Math.sin(T * 4 + k)) });
  });
}

/** The consciousness star: lit over the person, asked about ("star?") over every other being. Stamped TRIVIA, then dropped. */
function consciousStar(S: BeatState, T: number, w: Being, i: number, why: number): void {
  const person = i === PERSON, order = i > PERSON ? PERSON : i;
  const qp = person ? S.pop('ask', 0.5) : S.pop('ask', 1.0 + order * 0.35);
  const drop = why > 0 ? easeIn(cl((why - 0.2 - i * 0.12) / 0.6)) : 0;
  if (qp <= 0 || drop >= 1) return;
  A(1 - drop);
  tf(w.x, STAR_Y + drop * 220, qp, drop * 0.5, function () {
    if (person) spark(0, 0, 30, true, T); else starQuestion(T);
    triviaStamp(S.since('trivia') - STAMP_AT - i * STAMP_GAP, drop);
  });
  A(1);
}

/** A bubble asking whether this being has the star. */
function starQuestion(T: number): void {
  fillRR(-92, -48, 184, 96, 30, C.navy); poly([-14, 46, 14, 46, 0, 70], C.navy);
  c.save(); rr(-92, -48, 184, 96, 30); c.clip(); spark(-38, 0, 27, true, T); c.restore();
  txt('?', 38, 4, 70, C.cream, 'center', 700);
}

function triviaStamp(st: number, drop: number): void {
  if (st > 0) tf(0, 0, lerp(2.6, 1, easeOut(st / 0.18)), -0.2, function () {
    A((1 - drop) * cl(st / 0.1)); strokeRR(-108, -34, 216, 68, 10, C.red, 8); fillRR(-100, -26, 200, 52, 6, 'rgba(255,255,255,0.86)'); txt('TRIVIA', 0, 3, 50, C.red, 'center', 700);
  });
}

/** How richly does it model itself? A check where it clearly does; a question mark where no one can say. */
function selfModel(S: BeatState, w: Being, i: number): void {
  const sm = S.pop('matters', 3.0 + i * 0.2), mark = S.pop('matters', 3.3 + i * 0.2);
  if (sm > 0) tf(w.x, 176, sm, 0, function () {
    if (w.knowsSelf) badge('self', 0, 0, 40, '#12A99A');
    else { ring(0, 0, 40, C.cream, 4, [9, 8]); A(0.75); c.save(); c.scale(40 / 54, 40 / 54); icon('self', '#12A99A'); c.restore(); A(1); }
    if (mark > 0) tf(30, -30, mark, 0, function () { selfMark(w.knowsSelf); });
  });
}

function selfMark(knows: boolean): void {
  if (knows) { circ(0, 0, 17, C.green); check(0, 0, 15, C.white, 4.5); }
  else { circ(0, 0, 17, C.cream); txt('?', 0, 2, 26, C.ink, 'center', 700); }
}
