/* Pure: where each voice clip sits on the clock, when the music ducks, and summing clips into a buffer. */

import type { Beat } from '../shared/beats.ts';
import type { ClipLengths } from '../shared/contract.ts';

/** A clip that starts at `t` seconds from video start. */
export interface Placement { clip: string; speaker: string; beat: string; t: number }

/** Every clip the player plays: one per line of a beat, at beat start + line offset.
    The player skips a clip with no length (engine/audio/voiceTrack.ts activeClips), so this does too. */
export function placements(beats: Beat[], lengths: ClipLengths): Placement[] {
  return beats.flatMap(function (b) {
    return b.lines.filter(function (l) { return !!lengths[l.clip]; })
      .map(function (l) { return { clip: l.clip, speaker: l.speaker, beat: b.id, t: b.start + l.at }; });
  });
}

/** Intervals where at least one clip sounds: the player ducks the music exactly then. Sorted, merged. */
export function duckWindows(ps: Placement[], lengths: ClipLengths): [number, number][] {
  const spans = ps.map(function (p): [number, number] { return [p.t, p.t + lengths[p.clip]]; }).sort(function (a, b) { return a[0] - b[0]; });
  const out: [number, number][] = [];
  for (const s of spans) {
    const last = out[out.length - 1];
    if (last && s[0] <= last[1]) last[1] = Math.max(last[1], s[1]);
    else out.push([s[0], s[1]]);
  }
  return out;
}

/** Add `src` into `dst` starting at sample `at` (may be negative or past the end: the overlap is kept). */
export function mixAt(dst: Float32Array, src: Float32Array, at: number): void {
  const from = Math.max(0, -at), to = Math.min(src.length, dst.length - at);
  for (let i = from; i < to; i++) dst[at + i] += src[i];
}

/** The sample a time lands on, relative to a slice that starts at `start` seconds. */
export function sampleAt(t: number, start: number, rate: number): number {
  return Math.round((t - start) * rate);
}
