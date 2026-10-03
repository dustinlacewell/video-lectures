/* 5. The zombie: identical, minus inner experience. */

import type { BeatState } from '../engine/beatState';
import { A, c, tf, withA } from '../engine/canvas';
import { arrow, circ, cross, ell, fillRR, glow, line } from '../engine/draw';
import { PI, back, cl, ease, easeIn, lerp } from '../engine/math';
import { C } from '../engine/palette';
import { withCam } from '../engine/parallax';
import { bubble, tag, txt } from '../engine/text';
import { bean, type BeanOpts } from '../kit/bean';
import { badge } from '../kit/icons';
import { floaters, ground, stars } from '../kit/scenery';
import { spark } from '../kit/spark';
import type { Scene } from './types';

const GY = 600, YX = 400, ZX = 880, SC = 1.55;
const QUOTE = 'Yes. Obviously. I am experiencing this right now.';

export const zombie: Scene = {
  bg: ['#1F6A55', '#0D2A36'], accent: C.green,
  back: function (S, cam, T) {
    stars(cam, T, 51, 70, 0.15, '#D8FFE9');
    withCam(cam, 0.25, moon);
    withCam(cam, 0.5, graveyardHills);
    floaters(cam, T, 52, 10, [C.green, C.cyan], 0.4);
  },
  draw: function (S, cam, T) {
    ground(GY, -900, 2600, '#3FA57F', '#17564F');
    const f = feelings(S);
    person(S, T, f, YX, false, f.talkY);
    movieZombie(S, T);
    theCopy(S, T, f);
    nameTags(S);
    sameSameSame(S);
    oneDifference(S, T);
    questionAndAnswers(S, T);
    sameForm(S, T);
    theToe(S, f);
    painTags(S);
    bothSure(S);
  }
};

function moon(): void {
  glow(1010, 150, 200, '#EFFFD0', 0.25); circ(1010, 150, 62, '#F4FBD8'); circ(990, 136, 12, 'rgba(21,15,51,0.08)'); circ(1030, 170, 8, 'rgba(21,15,51,0.08)');
}

function graveyardHills(): void {
  c.fillStyle = 'rgba(8,40,40,0.55)';
  c.beginPath(); c.moveTo(-300, 620); c.quadraticCurveTo(200, 430, 640, 560); c.quadraticCurveTo(1000, 440, 1700, 620); c.closePath(); c.fill();
  [[150, 520], [1120, 528], [1260, 548]].forEach(function (q) { fillRR(q[0], q[1] - 70, 54, 80, 26, 'rgba(8,40,40,0.75)'); });
}

interface Feelings { toe: number; hop: number; hurt: boolean; grudge: boolean; talkZ: boolean; talkY: boolean; sure: number; wave: boolean }

function feelings(S: BeatState): Feelings {
  const toe = S.since('toe'), hop = toe > 1.25 && toe < 2.6 ? Math.abs(Math.sin((toe - 1.25) / 1.35 * PI * 2)) * (toe < 1.92 ? 70 : 32) : 0;
  const hurt = toe > 1.25 && toe < 2.9, grudge = toe >= 2.9 && !S.has('pain');
  const talkZ = (S.is('yes') && S.bt > 0.3 && S.bt < 2.2) || (S.is('sure') && S.bt < 1.6);
  const talkY = (S.is('yes') && S.bt > 2.6 && S.bt < 4.4) || (S.is('sure') && S.bt < 1.6);
  return { toe: toe, hop: hop, hurt: hurt, grudge: grudge, talkZ: talkZ, talkY: talkY, sure: S.on('sure', 0.2, 0.4), wave: S.is('same') };
}

/** You, or your twin: same figure, mirrored gaze. */
function person(S: BeatState, T: number, f: Feelings, x: number, isTwin: boolean, mouthTalk: boolean): void {
  const o: BeanOpts = { x: x, y: GY, s: SC, t: T, color: C.orange, phase: 0, lift: f.hop,
    look: f.hurt || f.grudge ? [isTwin ? -0.2 : 0.2, 0.9] : S.is('sure') ? [isTwin ? -0.8 : 0.8, 0] : S.has('ask') && !S.has('must') ? [-0.7, 0.2] : [isTwin ? -0.5 : 0.5, 0],
    mouth: f.hurt ? 'yell' : f.grudge ? 'frown' : mouthTalk ? 'talk' : 'smile', brow: f.grudge || S.is('sure') ? 1 : 0,
    armR: f.wave ? 2.5 + Math.sin(T * 5) * 0.25 : f.hurt ? 2.6 : 0.14, armL: f.hurt ? 2.6 : 0.14 };
  if (f.sure > 0) o.reachR = [x + lerp(84, 14, f.sure), GY - lerp(70, 150, f.sure)];
  bean(o);
}

/** The movie zombie, rejected. */
function movieZombie(S: BeatState, T: number): void {
  const mv = S.since('movie');
  if (mv > 0 && mv < 5.6) {
    const sink = ease((mv - 3.4) / 1.2), ma = back(mv / 0.45);
    withA(1 - sink, function () {
      bean({ x: ZX, y: GY + sink * 60, s: SC * Math.min(1, ma), t: T, color: '#8FCF63', phase: 5, tilt: -0.12, mouth: 'yell', brow: -1, look: [-0.8, 0.3], reachL: [ZX - 190, GY - 170], reachR: [ZX - 170, GY - 120] });
      line([ZX - 40, GY - 262, ZX + 10, GY - 250], C.ink, 4); line([ZX - 26, GY - 268, ZX - 22, GY - 252], C.ink, 3); line([ZX - 8, GY - 264, ZX - 4, GY - 248], C.ink, 3);
    });
    const xp = back((mv - 2.4) / 0.35);
    if (xp > 0) { A(1 - sink); tf(ZX, GY - 150, xp, 0, function () { cross(0, 0, 120, C.red, 26); }); A(1); }
  }
}

/** The twin is scanned into being, top to bottom. */
function theCopy(S: BeatState, T: number, f: Feelings): void {
  const cp = S.since('copy');
  if (cp < 0) return;
  const prog = cl((cp - 0.5) / 1.9), sy = lerp(GY - 300, GY + 6, prog);
  c.save(); c.beginPath(); c.rect(ZX - 200, GY - 420 - f.hop * SC, 400, (sy - (GY - 420)) + f.hop * SC + (prog >= 1 ? 60 : 0)); c.clip();
  person(S, T, f, ZX, true, f.talkZ);
  c.restore();
  if (prog > 0 && prog < 1) {
    line([YX - 120, sy, YX + 120, sy], C.cyan, 5); glow(YX, sy, 130, C.cyan, 0.25);
    line([ZX - 120, sy, ZX + 120, sy], C.cyan, 5); glow(ZX, sy, 130, C.cyan, 0.25);
    for (let i = 0; i < 9; i++) { const fr = ((T * 1.6 + i / 9) % 1); A(Math.sin(fr * PI)); circ(lerp(YX + 120, ZX - 120, fr), sy + Math.sin(fr * 9 + i) * 8, 4, C.cyan); }
    A(1);
  }
}

function nameTags(S: BeatState): void {
  tf(250, GY - 44, S.pop('intro', 0.5), 0, function () { tag('YOU', 0, 0, 30, C.cream, C.ink, 700); });
  const zt = S.pop('copy', 2.4);
  if (zt > 0) tf(1066, GY - 44, zt, 0, function () { tag('ZOMBIE', 0, 0, 30, C.green, C.ink, 700); });
}

function sameSameSame(S: BeatState): void {
  const sa = 1 - S.on('diff', 0, 0.4);
  ([['same body', 392], ['same brain', 452], ['same cognition', 512]] as [string, number][]).forEach(function (q, i) {
    const p = S.pop('same', 0.4 + i * 1.1);
    if (p <= 0 || sa <= 0) return;
    A(sa); tf(640, q[1] - 40, p, 0, function () { tag(q[0], 0, 0, 30, C.yellow, C.ink, 700); }); A(1);
  });
}

/** The one difference: a lit spark for you, an unlit one for the twin. */
function oneDifference(S: BeatState, T: number): void {
  const sv = Math.max(1 - S.on('ask', 0, 0.4), 0.0);
  const s1 = S.pop('diff', 0.5), s2 = S.pop('diff', 2.0);
  if (s1 > 0) tf(266, 380, s1, 0, function () { spark(0, 0, 24, true, T); });
  if (s2 > 0) tf(1014, 380, s2, 0, function () { spark(0, 0, 24, false, T); });
  if (s1 > 0 && sv > 0) { A(sv * cl(s1)); tag('inner experience', 196, 440, 24, C.yellow, C.ink); A(1); }
  if (s2 > 0 && sv > 0) { A(sv * cl(s2)); tag('no inner experience', 1086, 440, 24, C.grey, C.ink); A(1); }
  if (S.is('dark')) {
    const p1 = S.pop('dark', 2.0), p2 = S.pop('dark', 3.4);
    if (p1 > 0) tf(690, 330, p1, 0, function () { circ(0, 5, 36, 'rgba(0,0,0,0.25)'); circ(0, 0, 36, C.red); circ(-10, -10, 9, 'rgba(255,255,255,0.3)'); txt('redness: not felt', 0, 62, 24, C.cream, 'center', 600); });
    if (p2 > 0) badge('fear', 690, 480, 36, C.purple, { scale: p2, label: 'pain: not felt', ls: 24 });
  }
}

function questionAndAnswers(S: BeatState, T: number): void {
  const ak = S.on('ask', 0, 0.5) * (1 - S.on('must', 0, 0.4));
  if (ak > 0) {
    bean({ x: lerp(-40, 96, ak), y: GY, s: 1.1, t: T, color: C.teal, phase: 3, look: [0.8, -0.1], mouth: S.is('ask') && S.bt > 0.5 && S.bt < 1.8 ? 'talk' : 'smile', armR: 1.2, alpha: ak });
    const qb = S.pop('ask', 0.5) * (1 - S.on('yes', 0, 0.3));
    if (qb > 0) bubble('Are you conscious?', 150, 372, 30, { scale: qb, tail: -8, bg: C.cyan, dx: 40 });
  }
  const ya = 1 - S.on('must', 0, 0.3), zb = S.pop('yes', 0.3), yb = S.pop('yes', 2.6);
  if (zb > 0 && ya > 0) { A(ya); bubble(QUOTE, ZX, 310, 30, { scale: zb, maxW: 300 }); A(1); }
  if (yb > 0 && ya > 0) { A(ya); bubble(QUOTE, YX, 310, 30, { scale: yb, maxW: 300 }); A(1); }
}

/** Same form, same function. */
function sameForm(S: BeatState, T: number): void {
  const mu = S.on('must', 0.3, 0.5) * (1 - S.on('toe', 0, 0.4));
  if (mu > 0) withA(mu, function () {
    brain(YX, GY - 232, T); brain(ZX, GY - 232, T);
    tf(640, 330, S.pop('must', 0.6), 0, function () { tag('same form', 0, 0, 34, C.yellow, C.ink, 700); });
    const f2 = S.pop('must', 2.4);
    if (f2 > 0) { arrow(640, 366, 640, 412, C.yellow, 7); tf(640, 448, f2, 0, function () { tag('same function', 0, 0, 34, C.yellow, C.ink, 700); }); }
  });
}

function brain(x: number, y: number, T: number): void {
  ell(x, y, 54, 30, '#FF9DBB');
  const pts = [[-34, 4], [-18, -10], [0, 6], [18, -8], [34, 6]];
  for (let i = 0; i < 4; i++) line([x + pts[i][0], y + pts[i][1], x + pts[i + 1][0], y + pts[i + 1][1]], 'rgba(120,40,90,0.7)', 2.5);
  pts.forEach(function (p, i) {
    const f = cl(1 - Math.abs(((T * 1.2) % 2) - i * 0.3 - 0.2) / 0.3);
    if (f > 0.1) glow(x + p[0], y + p[1], 16, C.yellow, f * 0.8);
    circ(x + p[0], y + p[1], 5, f > 0.4 ? C.yellow : '#8A2F6A');
  });
}

/** A boot comes down on both toes at once. */
function theToe(S: BeatState, f: Feelings): void {
  const toe = f.toe;
  if (toe > 0.6 && toe < 3.2) {
    const by = toe < 1.25 ? lerp(-260, GY - 6, easeIn((toe - 0.7) / 0.55)) : lerp(GY - 6, -320, ease((toe - 1.7) / 0.8));
    boot(YX + 62, by); boot(ZX + 62, by);
    if (toe > 1.25) {
      const ow = back((toe - 1.25) / 0.3) * (1 - cl((toe - 2.6) / 0.4));
      if (ow > 0) { bubble('OW!', YX - 40, 300 - f.hop, 44, { scale: ow, bg: C.pink, fg: C.white }); bubble('OW!', ZX - 40, 300 - f.hop, 44, { scale: ow, bg: C.pink, fg: C.white }); }
    }
  }
}

function boot(x: number, y: number): void {
  fillRR(x + 46, y - 420, 46, 420, 12, '#2B1E4F'); fillRR(x - 22, y - 42, 114, 42, 16, '#2B1E4F'); fillRR(x - 22, y - 12, 114, 12, 6, '#150F33');
}

function painTags(S: BeatState): void {
  const pa = 1 - S.on('sure', 0, 0.4);
  ([['the ouch', 250], ['the recoil', 196], ['the dread', 142]] as [string, number][]).forEach(function (q, i) {
    const p = S.pop('pain', 0.5 + i * 0.7);
    if (p <= 0 || pa <= 0) return;
    A(pa);
    tf(YX, q[1] + 40, p, 0, function () { tag(q[0], 0, 0, 28, C.pink, C.white, 600); });
    tf(ZX, q[1] + 40, p, 0, function () { tag(q[0], 0, 0, 28, C.pink, C.white, 600); });
    A(1);
  });
}

function bothSure(S: BeatState): void {
  const su = S.pop('sure', 0.4);
  if (su > 0) { bubble('I am the conscious one.', YX, 310, 28, { scale: su, maxW: 240 }); bubble('I am the conscious one.', ZX, 310, 28, { scale: su, maxW: 240 }); }
}
