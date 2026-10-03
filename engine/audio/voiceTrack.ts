/* Pure: which voice clips sound at time T, and how far into each. */

import { chapterAt, type TimedBeat, type Timeline } from '../timeline';

/** A clip that should be sounding, `offset` seconds into it. */
export interface ActiveClip { clip: string; offset: number }

/** Clip lengths in seconds by clip id. A clip with no length is treated as missing. */
export type ClipLengths = Record<string, number>;

export function activeClips(tl: Timeline, T: number, clips: ClipLengths): ActiveClip[] {
  const ch = chapterAt(tl, T), t = T - ch.start, b = beatAt(ch.beats, t);
  const out: ActiveClip[] = [];
  b.lines.forEach(function (l) {
    const offset = t - b.start - l.at, len = clips[l.clip];
    if (len && offset >= 0 && offset < len) out.push({ clip: l.clip, offset: offset });
  });
  return out;
}

/** The clips of the beat after the one at T: worth loading ahead. */
export function upcomingClips(tl: Timeline, T: number): string[] {
  const ch = chapterAt(tl, T), b = beatAt(ch.beats, T - ch.start);
  const next = ch.beats[b.i + 1] || (tl.chapters[ch.ci + 1] && tl.chapters[ch.ci + 1].beats[0]);
  return next ? next.lines.map(function (l) { return l.clip; }) : [];
}

function beatAt(beats: TimedBeat[], t: number): TimedBeat {
  let r = beats[0];
  for (let i = 0; i < beats.length; i++) if (t >= beats[i].start) r = beats[i];
  return r;
}
