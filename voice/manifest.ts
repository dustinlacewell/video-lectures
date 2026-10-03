/* Pure: the script and cast -> one speech-synthesis job per voice clip. voice/render.py reads the result. */

import { createHash } from 'node:crypto';
import { spokenText, voiceLines } from '../engine/audio/voiceLines';
import type { Cast, ChapterScript, SpeakerId } from '../script/types';

export interface ManifestEntry {
  /** Clip id; the clip is voice/clips/<id>.wav. */
  id: string;
  beat: string;
  speaker: SpeakerId;
  /** The first cast key with this voice, so aliased speakers share a key. */
  voiceKey: SpeakerId;
  voice: string;
  text: string;
  /** Hash of text + voice. A changed hash means the clip is stale. */
  hash: string;
}

export function buildManifest(chapters: ChapterScript[], cast: Cast): ManifestEntry[] {
  return chapters.flatMap(function (ch) {
    return ch.beats.flatMap(function (b) {
      return voiceLines(b).map(function (l): ManifestEntry {
        const voice = cast[l.speaker].voice, text = spokenText(b.say!);
        return { id: l.clip, beat: b.id, speaker: l.speaker, voiceKey: voiceKeyOf(cast, voice), voice: voice, text: text, hash: hashOf(text, voice) };
      });
    });
  });
}

function voiceKeyOf(cast: Cast, voice: string): SpeakerId {
  return (Object.keys(cast) as SpeakerId[]).find(function (k) { return cast[k].voice === voice; })!;
}

function hashOf(text: string, voice: string): string {
  return createHash('sha256').update(text + '\n' + voice).digest('hex').slice(0, 16);
}
