/* Pure: which voice clips a beat plays, when they start, and the text sent to speech synthesis. */

import type { BeatScript } from '../script';

/** One speaker's clip in a beat. `at` is seconds after the beat starts. */
export interface VoiceLine<S extends string = string> { clip: string; speaker: S; at: number }

/** Every cast has this speaker. */
export const DEFAULT_SPEAKER = 'narrator';
export const DEFAULT_STAGGER = 0.15;

export function speakersOf<S extends string>(b: BeatScript<S>): S[] {
  if (!b.speaker) return [DEFAULT_SPEAKER as S];
  return Array.isArray(b.speaker) ? b.speaker : [b.speaker];
}

/** The words a beat speaks: its line, else its card text, which the narrator reads aloud. */
export function lineOf(b: BeatScript): string | undefined {
  return b.say ?? b.card;
}

/** A beat with a line or a card has one clip per speaker, speaker k starting k * stagger in. */
export function voiceLines<S extends string>(b: BeatScript<S>): VoiceLine<S>[] {
  if (!lineOf(b)) return [];
  const speakers = speakersOf(b), stagger = b.stagger ?? DEFAULT_STAGGER;
  return speakers.map(function (s, k) { return { clip: clipId(b.id, s, speakers.length > 1), speaker: s, at: k * stagger }; });
}

/** "<beatId>" for a single speaker, "<beatId>.<speaker>" when several speak together. */
export function clipId(beatId: string, speaker: string, several: boolean): string {
  return several ? beatId + '.' + speaker : beatId;
}

/** Caption text minus caption-only formatting: *italic* asterisks and quote marks around the whole line. */
export function spokenText(say: string): string {
  const t = say.replace(/\*/g, '').trim(), quoted = /^["“‘'](.*)["”’']$/s.exec(t);
  return quoted ? quoted[1].trim() : t;
}

/** A narrator line is a caption. A character line is drawn by its scene. */
export function captionOf(b: BeatScript): string | undefined {
  return speakersOf(b).indexOf('narrator') >= 0 ? b.say : undefined;
}
