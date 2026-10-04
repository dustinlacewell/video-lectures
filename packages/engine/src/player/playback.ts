/* Playback state: the clock T, play/pause, speed, sound cues, voice, and drawing the current frame. */

import { auPad, auMusic, setSound } from '../audio/music';
import { sfx } from '../audio/sfx';
import { AU, auInit } from '../audio/synth';
import type { VoiceTrack } from '../audio/voice';
import { resetGrain } from '../grain';
import { H, W } from '../math';
import { renderFrame, type SceneMap } from '../render';
import { clearWrapCache } from '../text';
import { chapterAt, firstCueAt, type TimedChapter, type Timeline } from '../timeline';

/** What the page shows about playback after each frame. */
export interface PlayState {
  T: number;
  total: number;
  playing: boolean;
  rate: number;
  soundOn: boolean;
  /** Index of the chapter at T. */
  chapter: number;
}

export interface Playback {
  render(): void;
  /** The clock T in seconds. */
  time(): number;
  toggle(): void;
  seek(T: number): void;
  jumpTo(ch: TimedChapter): void;
  fit(): void;
  setSpeed(rate: number): void;
  toggleSound(): boolean;
  fontsLoaded(): void;
  start(): void;
  /** Call fn after every drawn frame and every state change. */
  onFrame(fn: (s: PlayState) => void): void;
}

const MAX_CANVAS_W = 1920;

export function createPlayback(tl: Timeline, scenes: SceneMap, cv: HTMLCanvasElement, voice: VoiceTrack): Playback {
  let T = 0, playing = false, lastTs = 0, cueI = 0, RATE = 1;
  const listeners: ((s: PlayState) => void)[] = [];

  function render(): void {
    if (T >= tl.total) { T = tl.total - 0.001; setPlaying(false); }
    if (T < 0) T = 0;
    renderFrame(tl, scenes, T, cv.width / W);
    notify();
  }

  function notify(): void {
    const s: PlayState = { T: T, total: tl.total, playing: playing, rate: RATE, soundOn: AU.on, chapter: chapterAt(tl, T).ci };
    listeners.forEach(function (fn) { fn(s); });
  }

  /** Skip cues before T so seeking does not replay them. A cue exactly at T still plays. */
  function resetCues(): void { cueI = firstCueAt(tl.cues, T); }

  function setPlaying(v: boolean): void {
    playing = v;
    if (v) { auInit(); if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume(); resetCues(); }
    auPad(v);
    syncVoice(true);
  }

  function syncVoice(jumped: boolean): void { voice.sync(T, { playing: playing, rate: RATE, jumped: jumped }); }

  /** Move the clock to v without playing the sounds in between. */
  function jump(v: number): void { T = v; resetCues(); render(); syncVoice(true); }

  function tick(ts: number): void {
    if (playing) {
      T += Math.min(0.1, (ts - lastTs) / 1000) * RATE;
      while (cueI < tl.cues.length && tl.cues[cueI].t <= T) { sfx(tl.cues[cueI].type, tl.cues[cueI].arg); cueI++; }
      auMusic(T, chapterAt(tl, T));
      render();
      syncVoice(false);
    }
    lastTs = ts;
    requestAnimationFrame(tick);
  }

  return {
    render: render,
    time: function () { return T; },
    toggle: function () { if (!playing && T >= tl.total - 0.05) T = 0; setPlaying(!playing); render(); },
    seek: jump,
    jumpTo: function (ch) { jump(ch.start + 0.01); },
    fit: function () {
      const w = cv.clientWidth || 640, d = window.devicePixelRatio || 1;
      cv.width = Math.min(MAX_CANVAS_W, Math.round(w * d)); cv.height = Math.round(cv.width * H / W);
      resetGrain(); render();
    },
    setSpeed: function (rate) { RATE = rate; notify(); },
    toggleSound: function () { setSound(!AU.on, playing); notify(); return AU.on; },
    fontsLoaded: function () { clearWrapCache(); render(); },
    start: function () { requestAnimationFrame(tick); },
    onFrame: function (fn) { listeners.push(fn); }
  };
}
