/* Pure: the script, cast and reference clips -> one speech-synthesis job per voice clip. voice/render.py reads the result. */

import { createHash } from 'node:crypto';
import { lineOf, spokenText, voiceLines } from '../engine/audio/voiceLines';
import type { Cast, ChapterScript, SpeakerId } from '../script/types';

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

export function buildManifest(chapters: ChapterScript[], cast: Cast, refs: Refs): ManifestEntry[] {
  return chapters.flatMap(function (ch) {
    return ch.beats.flatMap(function (b) {
      return voiceLines(b).map(function (l): ManifestEntry {
        const voice = voiceOf(cast, l.speaker, refs), text = spokenText(lineOf(b)!);
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
