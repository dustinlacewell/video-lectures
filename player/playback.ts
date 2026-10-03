/* Playback state: the clock T, play/pause, speed, sound cues, and drawing the current frame. */

import { auPad, auMusic, setSound } from '../engine/audio/music';
import { sfx } from '../engine/audio/sfx';
import { AU, auInit } from '../engine/audio/synth';
import { resetGrain } from '../engine/grain';
import { H, W } from '../engine/math';
import { renderFrame, type SceneMap } from '../engine/render';
import { clearWrapCache } from '../engine/text';
import { chapterAt, type TimedChapter, type Timeline } from '../engine/timeline';
import type { PlayerEls } from './dom';
import { markChip } from './scriptText';

export interface Playback {
  render(): void;
  toggle(): void;
  seek(T: number): void;
  jumpTo(ch: TimedChapter): void;
  fit(): void;
  cycleSpeed(): number;
  toggleSound(): boolean;
  fontsLoaded(): void;
  start(): void;
}

const MAX_CANVAS_W = 1920;
const SPEEDS: Record<number, number> = { 1: 1.25, 1.25: 1.5, 1.5: 1 };

export function createPlayback(tl: Timeline, scenes: SceneMap, els: PlayerEls): Playback {
  let T = 0, playing = false, lastTs = 0, cueI = 0, curCh = -1, RATE = 1;
  els.seek.max = tl.total.toFixed(1);

  function render(): void {
    if (T >= tl.total) { T = tl.total - 0.001; setPlaying(false); }
    if (T < 0) T = 0;
    renderFrame(tl, scenes, T, els.cv.width / W);
    syncUi(chapterAt(tl, T).ci);
  }

  function syncUi(ci: number): void {
    if (curCh !== ci) { curCh = ci; markChip(els.chips, ci); }
    if (document.activeElement !== els.seek || playing) els.seek.value = T.toFixed(1);
    els.time.textContent = fmt(T) + ' / ' + fmt(tl.total);
    els.play.textContent = playing ? 'Pause' : (T > 0.05 ? 'Resume' : 'Play');
  }

  /** Skip cues at or before T so seeking does not replay them. */
  function resetCues(): void { cueI = 0; while (cueI < tl.cues.length && tl.cues[cueI].t <= T) cueI++; }

  function setPlaying(v: boolean): void {
    playing = v;
    if (v) { auInit(); if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume(); resetCues(); }
    auPad(v);
  }

  function tick(ts: number): void {
    if (playing) {
      T += Math.min(0.1, (ts - lastTs) / 1000) * RATE;
      while (cueI < tl.cues.length && tl.cues[cueI].t <= T) { sfx(tl.cues[cueI].type, tl.cues[cueI].arg); cueI++; }
      auMusic(T, chapterAt(tl, T));
      render();
    }
    lastTs = ts;
    requestAnimationFrame(tick);
  }

  return {
    render: render,
    toggle: function () { if (!playing && T >= tl.total - 0.05) T = 0; setPlaying(!playing); render(); },
    seek: function (v) { T = v; resetCues(); render(); },
    jumpTo: function (ch) { T = ch.start + 0.01; resetCues(); render(); },
    fit: function () {
      const w = els.cv.clientWidth || 640, d = window.devicePixelRatio || 1;
      els.cv.width = Math.min(MAX_CANVAS_W, Math.round(w * d)); els.cv.height = Math.round(els.cv.width * H / W);
      resetGrain(); render();
    },
    cycleSpeed: function () { RATE = SPEEDS[RATE]; return RATE; },
    toggleSound: function () { setSound(!AU.on, playing); return AU.on; },
    fontsLoaded: function () { clearWrapCache(); render(); },
    start: function () { requestAnimationFrame(tick); }
  };
}

function fmt(s: number): string { s = Math.floor(s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
