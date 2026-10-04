/* Pure: where we are inside a chapter at local time t, plus beat-relative timing helpers. */

import { back, cl, ease } from './math';
import { curveOf } from './sync/ease';
import type { TimedAction, TimedBeat, TimedChapter } from './timeline';

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
  /** Progress of action `name` of this chapter along its curve: 0 before it starts, 1 after it ends. */
  act(name: string): number;
  /** Seconds since action `name` started; negative before. */
  sinceAct(name: string): number;
  /** Seconds from chapter start at which action `name` starts: the clock of `t`. */
  actT(name: string): number;
}

export function mkS(ch: TimedChapter, t: number): BeatState {
  let bi = 0;
  for (let i = 0; i < ch.beats.length; i++) if (t >= ch.beats[i].start) bi = i;
  const b = ch.beats[bi];
  const actOf = function (name: string): TimedAction {
    const a = ch.acts[name];
    if (!a) throw new Error('chapter "' + ch.id + '" has no action "' + name + '"');
    return a;
  };
  const S: BeatState = {
    t: t, bi: bi, b: b, bt: t - b.start, lp: cl((t - b.start) / b.dur), ch: ch,
    since: function (id) { const k = ch.idx[id]; return k === undefined ? -1e9 : t - ch.beats[k].start; },
    on: function (id, delay, dur) { return ease((S.since(id) - (delay || 0)) / (dur || 0.5)); },
    pop: function (id, delay, dur) { return back((S.since(id) - (delay || 0)) / (dur || 0.45)); },
    has: function (id) { return S.since(id) >= 0; },
    is: function (id) { return ch.idx[id] === bi; },
    act: function (name) {
      const a = actOf(name);
      return a.dur > 0 ? curveOf(a.ease)(cl((t - a.start) / a.dur)) : t >= a.start ? 1 : 0;
    },
    sinceAct: function (name) { return t - actOf(name).start; },
    actT: function (name) { return actOf(name).start; }
  };
  return S;
}
