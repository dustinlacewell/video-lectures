/* Pure: measured speaking rates, the numbers a writer budgets the next script with. */

import type { Beat } from '../shared/beats.ts';
import type { ClipLengths } from '../shared/contract.ts';

/** One speaker over the measured span. A chorus line counts for each speaker in it. */
export interface SpeakerRate {
  speaker: string;
  /** Lines with a measured clip. */
  lines: number;
  words: number;
  /** Seconds of this speaker's clips. */
  audio: number;
  /** Words per second of the speaker's own audio. */
  perAudio: number;
  /** Words per second of the measured runtime. */
  perRuntime: number;
  /** Lines left out because their clip length is unknown. */
  missing: number;
}

/** Spoken words (each beat once) over the measured runtime. Card and title words that nobody reads are not spoken. */
export interface VideoRate { words: number; runtime: number; perRuntime: number }

export function videoRate(beats: Beat[], runtime: number): VideoRate {
  const words = beats.filter(function (b) { return b.lines.length > 0; }).reduce(function (s, b) { return s + b.words; }, 0);
  return { words: words, runtime: runtime, perRuntime: runtime > 0 ? words / runtime : 0 };
}

/** Per speaker, most words first. */
export function speakerRates(beats: Beat[], clips: ClipLengths, runtime: number): SpeakerRate[] {
  const acc = new Map<string, { lines: number; words: number; audio: number; missing: number }>();
  beats.forEach(function (b) {
    b.lines.forEach(function (l) {
      const a = acc.get(l.speaker) ?? { lines: 0, words: 0, audio: 0, missing: 0 };
      const len = clips[l.clip];
      if (len) { a.lines++; a.words += b.words; a.audio += len; } else a.missing++;
      acc.set(l.speaker, a);
    });
  });
  return Array.from(acc, function ([speaker, a]) {
    return { speaker: speaker, ...a, perAudio: a.audio > 0 ? a.words / a.audio : 0, perRuntime: runtime > 0 ? a.words / runtime : 0 };
  }).sort(function (p, q) { return q.words - p.words; });
}
