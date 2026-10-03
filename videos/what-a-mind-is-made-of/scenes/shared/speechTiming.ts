/* Pure: when a character speaks its line, and which speech bubbles show at a moment, at what scale. */

import type { BeatState } from '../../engine/beatState';
import { back, ease } from '../../engine/math';
import { DEFAULT_PAD, type TimedBeat } from '../../engine/timeline';
import { CAST } from '../../script/cast';
import type { SpeakerId } from '../../script/types';

/** Seconds into a beat. */
export interface Window { start: number; end: number }

/** A line's bubble stays until the beat with this key starts; null keeps it to the chapter's end.
    Without an entry, a bubble leaves when the next beat starts. */
export type Holds = Record<string, string | null>;

export interface ShownLine { beat: TimedBeat; who: SpeakerId; scale: number }

/** Seconds for a bubble to pop in, and to shrink away. */
export const POP = 0.4, EXIT = 0.28;

/** A generous guess at a line's spoken length: words plus a pause per punctuation mark.
    It only caps the mouth when a beat is held longer than its clip, so it errs long. */
export function speechSeconds(say: string): number {
  const words = say.trim().split(/\s+/).length, pauses = (say.match(/[.,:;!?]/g) || []).length;
  return 0.5 + 0.42 * words + 0.25 * pauses;
}

/** When `who` speaks in beat `b`, or undefined if it does not. The last clip ends one pad before the beat does;
    earlier speakers end earlier by their stagger. */
export function talkWindow(b: TimedBeat, who: SpeakerId): Window | undefined {
  const line = b.lines.find(function (l) { return l.speaker === who; });
  if (!line || who === 'narrator' || !b.say) return undefined;
  const last = b.lines[b.lines.length - 1].at;
  const pad = Math.max(...b.lines.map(function (l) { return CAST[l.speaker].pad ?? DEFAULT_PAD; }));
  const end = Math.min(line.at + speechSeconds(b.say), b.dur - pad - (last - line.at));
  return { start: line.at, end: Math.max(line.at + 0.3, end) };
}

/** Seconds into `who`'s line in the current beat while it speaks, else undefined. */
export function talkTime(S: BeatState, who: SpeakerId): number | undefined {
  const w = talkWindow(S.b, who);
  return w && S.bt >= w.start && S.bt <= w.end ? S.bt - w.start : undefined;
}

/** Every character bubble on screen now: each pops in when its speaker starts and shrinks away when its beat is let go. */
export function shownLines(S: BeatState, holds: Holds = {}): ShownLine[] {
  const out: ShownLine[] = [];
  for (let i = 0; i <= S.bi; i++) {
    const b = S.ch.beats[i], gone = sinceRelease(S, i, holds);
    if (!b.say || gone >= EXIT) continue;
    const fade = gone > 0 ? 1 - ease(gone / EXIT) : 1;
    b.lines.forEach(function (l) {
      if (l.speaker === 'narrator') return;
      const scale = back((S.t - b.start - l.at) / POP) * fade;
      if (scale > 0) out.push({ beat: b, who: l.speaker, scale: scale });
    });
  }
  return out;
}

/** Seconds since beat i's bubbles were let go (negative while they stay). */
function sinceRelease(S: BeatState, i: number, holds: Holds): number {
  const key = S.ch.beats[i].key;
  if (!(key in holds)) return i + 1 < S.ch.beats.length ? S.t - S.ch.beats[i + 1].start : -1;
  const until = holds[key];
  if (until === null) return -1;
  if (S.ch.idx[until] === undefined) throw new Error('speech hold: no beat "' + until + '" in chapter ' + S.ch.id);
  return S.since(until);
}
