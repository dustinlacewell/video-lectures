/* Pure: which voice clips a beat plays, when they start, and the text sent to speech synthesis. */

import type { BeatScript, SpeakerId } from '../../script/types';

/** One speaker's clip in a beat. `at` is seconds after the beat starts. */
export interface VoiceLine { clip: string; speaker: SpeakerId; at: number }

export const DEFAULT_SPEAKER: SpeakerId = 'narrator';
export const DEFAULT_STAGGER = 0.15;

export function speakersOf(b: BeatScript): SpeakerId[] {
  if (!b.speaker) return [DEFAULT_SPEAKER];
  return Array.isArray(b.speaker) ? b.speaker : [b.speaker];
}

/** A beat with a line has one clip per speaker, speaker k starting k * stagger in. */
export function voiceLines(b: BeatScript): VoiceLine[] {
  if (!b.say) return [];
  const speakers = speakersOf(b), stagger = b.stagger ?? DEFAULT_STAGGER;
  return speakers.map(function (s, k) { return { clip: clipId(b.id, s, speakers.length > 1), speaker: s, at: k * stagger }; });
}

/** "<beatId>" for a single speaker, "<beatId>.<speaker>" when several speak together. */
export function clipId(beatId: string, speaker: SpeakerId, several: boolean): string {
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
