/* Screen-space overlays: captions, cards, chapter title cards. */

import { c } from './canvas';
import { fillRR } from './draw';
import { H, W, back, cl, ease, easeOut, lerp } from './math';
import { C } from './palette';
import { tw, txt, wrap } from './text';

export function drawCaption(say: string | undefined, bt: number, dur: number): void {
  if (!say) return;
  const size = 44, lines = wrap(say, size, 600, 1110), lh = 54;
  let wMax = 0;
  lines.forEach(function (l) { wMax = Math.max(wMax, tw(l, size, 600)); });
  const w = wMax + 56, h = lines.length * lh + 26, x = (W - w) / 2, y = H - 26 - h;
  const a = ease(bt / 0.3) * ease((dur - bt) / 0.25), dy = (1 - easeOut(bt / 0.35)) * 16;
  c.globalAlpha = a * 0.82; fillRR(x, y + dy, w, h, 20, '#0C0828');
  c.globalAlpha = a;
  lines.forEach(function (l, i) { txt(l, W / 2, y + dy + 13 + lh * (i + 0.5), size, C.cream, 'center', 600); });
  c.globalAlpha = 1;
}

/** Full-screen card; words pop in one at a time. */
export function drawCard(card: string, bt: number, dur: number, accent: string | undefined): void {
  const size = 74, lines = wrap(card, size, 700, 940), lh = 88, a = ease(bt / 0.35) * ease((dur - bt) / 0.35);
  c.globalAlpha = a * 0.62; c.fillStyle = '#0C0828'; c.fillRect(0, 0, W, H);
  let wMax = 0;
  lines.forEach(function (l) { wMax = Math.max(wMax, tw(l, size, 700)); });
  const w = wMax + 120, h = lines.length * lh + 90, x = (W - w) / 2, y = (H - h) / 2 - 10;
  const sc = lerp(0.86, 1, back(bt / 0.5));
  c.save(); c.translate(W / 2, H / 2); c.scale(sc, sc); c.translate(-W / 2, -H / 2);
  c.globalAlpha = a; fillRR(x + 10, y + 12, w, h, 34, 'rgba(0,0,0,0.35)'); fillRR(x, y, w, h, 34, accent || C.yellow);
  let k = 0;
  lines.forEach(function (l, i) {
    const words = l.split(' '), full = tw(l, size, 700), sp = tw(' ', size, 700);
    let xx = W / 2 - full / 2;
    words.forEach(function (wd) {
      const ww = tw(wd, size, 700), u = back((bt - 0.25 - k * 0.11) / 0.4);
      c.globalAlpha = a * cl((bt - 0.25 - k * 0.11) / 0.15);
      c.save(); c.translate(xx + ww / 2, y + 45 + lh * (i + 0.5)); c.scale(lerp(0.5, 1, u), lerp(0.5, 1, u));
      txt(wd, 0, 0, size, C.ink, 'center', 700); c.restore();
      xx += ww + sp; k++;
    });
  });
  c.restore(); c.globalAlpha = 1;
}

export interface TitleCardLook { number: number; title: string; bgDark: string; accent: string }

export function drawChapterTitle(look: TitleCardLook, bt: number, dur: number): void {
  const a = ease(bt / 0.3) * ease((dur - bt) / 0.5);
  c.globalAlpha = a * 0.9; c.fillStyle = look.bgDark; c.fillRect(0, 0, W, H);
  c.globalAlpha = a;
  const u = easeOut(bt / 0.7), x = 120 - (1 - u) * 60;
  fillRR(x, 250, 110, 110, 30, look.accent); txt(String(look.number), x + 55, 308, 76, C.ink, 'center', 700);
  const lines = wrap(look.title, 82, 700, 900);
  lines.forEach(function (l, i) {
    const v = easeOut((bt - 0.15 - i * 0.12) / 0.7);
    c.globalAlpha = a * v; txt(l, 120 - (1 - v) * 50, 440 + i * 94, 82, C.cream, 'left', 700);
  });
  c.globalAlpha = a; fillRR(120, 392 - 6, 520 * easeOut((bt - 0.2) / 0.9), 8, 4, look.accent);
  c.globalAlpha = 1;
}
