/* One frame at time T: background, world, overlays, fades, cards, caption, grain. */

import type { Scene } from './scene';
import { mkS, type BeatState } from './beatState';
import { camAt } from './camera';
import { c, resetAlpha } from './canvas';
import { bgGradient } from './draw';
import { H, W, ease } from './math';
import { drawCaption, drawCard, drawChapterTitle } from './overlays';
import { drawGrain } from './grain';
import { chapterAt, type TimedChapter, type Timeline } from './timeline';

export type SceneMap = Record<string, Scene>;

const FADE_IN = 0.45;
const FADE_OUT = 0.4;

/** Draw the frame at T. `scale` maps the 1280x720 virtual stage to canvas pixels. */
export function renderFrame(tl: Timeline, scenes: SceneMap, T: number, scale: number): void {
  const ch = chapterAt(tl, T), t = T - ch.start, S = mkS(ch, t), cam = camAt(ch, S), scene = scenes[ch.id];
  c.setTransform(scale, 0, 0, scale, 0, 0); resetAlpha();
  bgGradient(scene.bg[0], scene.bg[1]);
  if (scene.back) scene.back(S, cam, T);
  resetAlpha();
  c.save(); c.translate(W / 2, H / 2); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  scene.draw(S, cam, T);
  c.restore(); resetAlpha();
  if (scene.over) { scene.over(S, cam, T); resetAlpha(); }
  drawFades(tl, scenes, ch, t);
  drawBeatOverlays(S, ch, scene);
  drawGrain(T);
}

/** Fade in from this chapter's dark colour; fade out to the next chapter's. */
function drawFades(tl: Timeline, scenes: SceneMap, ch: TimedChapter, t: number): void {
  const nx = tl.chapters[ch.ci + 1];
  const fi = ch.ci > 0 ? 1 - ease(t / FADE_IN) : 0, fo = nx ? ease((t - (ch.dur - FADE_OUT)) / FADE_OUT) : 0;
  if (fi > 0) { c.globalAlpha = fi; c.fillStyle = scenes[ch.id].bg[1]; c.fillRect(0, 0, W, H); }
  if (fo > 0) { c.globalAlpha = fo; c.fillStyle = scenes[nx.id].bg[1]; c.fillRect(0, 0, W, H); }
  c.globalAlpha = 1;
}

function drawBeatOverlays(S: BeatState, ch: TimedChapter, scene: Scene): void {
  const b = S.b;
  if (b.chTitle) drawChapterTitle({ number: ch.ci, title: ch.title || '', bgDark: scene.bg[1], accent: scene.accent }, S.bt, b.dur);
  if (b.card) drawCard(b.card, S.bt, b.dur, scene.accent);
  drawCaption(b.caption, S.bt, b.dur);
}
