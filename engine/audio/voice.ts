/* The voice track: one audio element per clip, kept in step with the clock T. */

import type { Timeline } from '../timeline';
import { duckMusic } from './music';
import { AU } from './synth';
import { activeClips, stopsNow, upcomingClips, type ClipLengths, type ClockMove } from './voiceTrack';

/** On a jump, every clip goes to its exact offset. */
export interface VoiceSync extends ClockMove {
  rate: number;
}

export interface VoiceTrack {
  sync(T: number, s: VoiceSync): void;
  /** Clips playing now and how far into each. */
  now(): { id: string; offset: number; paused: boolean }[];
}

/** Re-seek a clip when it drifts this far (seconds) from the clock. */
const DRIFT = 0.25;
/** Right after a clip starts sounding, re-seek when it lags more than this. */
const SNAP = 0.04;

export function createVoiceTrack(tl: Timeline, clips: ClipLengths, urlOf: (clip: string) => string): VoiceTrack {
  const els = new Map<string, HTMLAudioElement>(), live = new Map<string, HTMLAudioElement>();
  /** Clips that just began sounding: snap to the clock once, to undo the start-up delay. */
  const fresh = new Set<string>(), snap = new Set<string>();
  let ducked = false;

  function el(clip: string): HTMLAudioElement {
    let a = els.get(clip);
    if (!a) {
      a = new Audio(urlOf(clip)); a.preload = 'auto'; a.preservesPitch = true;
      a.addEventListener('playing', function () { if (fresh.delete(clip)) snap.add(clip); });
      els.set(clip, a);
    }
    return a;
  }

  function stopStale(want: Set<string>, s: VoiceSync): void {
    live.forEach(function (a, clip) {
      if (stopsNow(want.has(clip), a.ended || a.paused, s)) { a.pause(); live.delete(clip); }
    });
  }

  function keepInStep(clip: string, offset: number, s: VoiceSync): void {
    const a = el(clip), started = live.has(clip);
    a.muted = !AU.on;
    if (a.playbackRate !== s.rate) a.playbackRate = s.rate;
    const drift = Math.abs(a.currentTime - offset), tolerance = snap.delete(clip) ? SNAP : DRIFT * s.rate;
    if (!started || s.jumped) a.currentTime = offset;
    else if (!a.ended && !a.seeking && a.readyState >= 2 && drift > tolerance) a.currentTime = offset;
    if (!started) { live.set(clip, a); fresh.add(clip); a.play().catch(function () {}); }
  }

  function duck(under: boolean): void {
    if (under !== ducked) { ducked = under; duckMusic(under); }
  }

  return {
    sync: function (T, s) {
      const want = s.playing ? activeClips(tl, T, clips) : [];
      stopStale(new Set(want.map(function (w) { return w.clip; })), s);
      want.forEach(function (w) { keepInStep(w.clip, w.offset, s); });
      if (s.playing) upcomingClips(tl, T).forEach(el);
      duck(live.size > 0);
    },
    now: function () {
      const out: { id: string; offset: number; paused: boolean }[] = [];
      live.forEach(function (a, clip) { out.push({ id: clip, offset: a.currentTime, paused: a.paused }); });
      return out;
    }
  };
}
