/* Pure: the script, cast and reference clips -> one speech-synthesis job per voice clip. voice/render.py reads the result.
 *
 * This package has no video's engine or script to import, so the shapes it needs are generic (SpeakerId = string)
 * and the beat-reading functions (lineOf, spokenText, voiceLines) are passed in by the caller, which does have them.
 */

import { createHash } from 'node:crypto';

export type SpeakerId = string;

/** The one piece of a beat buildManifest reads: its speaker lines (from the video's own voiceLines.ts). */
export interface VoiceLine { clip: string; speaker: SpeakerId; at: number }

/** The three beat-reading functions a video's engine provides; buildManifest calls them, never imports them. */
export interface LineReader<Beat> {
  lineOf(b: Beat): string | undefined;
  spokenText(say: string): string;
  voiceLines(b: Beat): VoiceLine[];
}

export interface ChapterScript<Beat> { beats: Beat[] }

export interface CastMember {
  ref: string;
  refText?: string;
  style?: string;
}

export type Cast = Record<SpeakerId, CastMember>;

/** What the manifest needs to know about one reference clip. voice/refs.ts reads it from disk. */
export interface RefInfo {
  /** Hash of the clip's audio bytes. */
  hash: string;
  /** The transcript file beside the clip, if there is one. */
  text?: string;
}

/** Reference clips by their cast path (relative to voice/). */
export type Refs = Record<string, RefInfo>;

/** One speaker's voice: the clip to clone, its transcript, and the optional delivery direction. */
interface Voice {
  ref: string;
  refText: string;
  style?: string;
}

export interface ManifestEntry {
  /** Clip id; the clip is voice/clips/<id>.wav. */
  id: string;
  beat: string;
  speaker: SpeakerId;
  /** The first cast key with this voice, so aliased speakers share a key. */
  voiceKey: SpeakerId;
  ref: string;
  refText: string;
  style?: string;
  text: string;
  /** Hash of text + ref audio + ref transcript + style. A changed hash means the clip is stale. */
  hash: string;
}

export function buildManifest<Beat extends { id: string }>(
  chapters: ChapterScript<Beat>[], cast: Cast, refs: Refs, reader: LineReader<Beat>
): ManifestEntry[] {
  return chapters.flatMap(function (ch) {
    return ch.beats.flatMap(function (b) {
      return reader.voiceLines(b).map(function (l): ManifestEntry {
        const voice = voiceOf(cast, l.speaker, refs), text = reader.spokenText(reader.lineOf(b)!);
        return {
          id: l.clip, beat: b.id, speaker: l.speaker, voiceKey: voiceKeyOf(cast, voice, refs), ...voice,
          text: text, hash: hashOf(text, voice, refs[voice.ref].hash)
        };
      });
    });
  });
}

function voiceOf(cast: Cast, speaker: SpeakerId, refs: Refs): Voice {
  const m = cast[speaker], info = refs[m.ref];
  if (!info) throw new Error(`${speaker}: reference clip ${m.ref} not found`);
  const refText = (m.refText ?? info.text ?? '').trim();
  if (!refText) throw new Error(`${speaker}: no transcript for ${m.ref} (set refText or add the .txt beside it)`);
  return m.style ? { ref: m.ref, refText: refText, style: m.style } : { ref: m.ref, refText: refText };
}

function voiceKeyOf(cast: Cast, voice: Voice, refs: Refs): SpeakerId {
  const same = JSON.stringify(voice);
  return (Object.keys(cast) as SpeakerId[]).find(function (k) { return JSON.stringify(voiceOf(cast, k, refs)) === same; })!;
}

function hashOf(text: string, voice: Voice, refHash: string): string {
  return createHash('sha256').update([text, refHash, voice.refText, voice.style ?? ''].join('\n')).digest('hex').slice(0, 16);
}
