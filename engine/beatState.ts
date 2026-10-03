/* Pure: where we are inside a chapter at local time t, plus beat-relative timing helpers. */

import { back, cl, ease } from './math';
import type { TimedBeat, TimedChapter } from './timeline';

export interface BeatState {
  /** Seconds since chapter start. */
  t: number;
  bi: number;
  b: TimedBeat;
  /** Seconds since beat start. */
  bt: number;
  /** Progress through the beat, 0..1. */
  lp: number;
  ch: TimedChapter;
  /** Seconds since beat `key` started (very negative if unknown). */
  since(key: string): number;
  /** 0..1 smooth ramp starting `delay` after beat `key`. */
  on(key: string, delay?: number, dur?: number): number;
  /** 0..1 overshooting pop starting `delay` after beat `key`. */
  pop(key: string, delay?: number, dur?: number): number;
  has(key: string): boolean;
  is(key: string): boolean;
  ended(key: string): number;
}

export function mkS(ch: TimedChapter, t: number): BeatState {
  let bi = 0;
  for (let i = 0; i < ch.beats.length; i++) if (t >= ch.beats[i].start) bi = i;
  const b = ch.beats[bi];
  const S: BeatState = {
    t: t, bi: bi, b: b, bt: t - b.start, lp: cl((t - b.start) / b.dur), ch: ch,
    since: function (id) { const k = ch.idx[id]; return k === undefined ? -1e9 : t - ch.beats[k].start; },
    on: function (id, delay, dur) { return ease((S.since(id) - (delay || 0)) / (dur || 0.5)); },
    pop: function (id, delay, dur) { return back((S.since(id) - (delay || 0)) / (dur || 0.45)); },
    has: function (id) { return S.since(id) >= 0; },
    is: function (id) { return ch.idx[id] === bi; },
    ended: function (id) {
      const k = ch.idx[id];
      if (k === undefined) return -1e9;
      return t - (ch.beats[k].start + ch.beats[k].dur);
    }
  };
  return S;
}
