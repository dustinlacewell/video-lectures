import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { lineOf, spokenText, voiceLines } from '@studio/engine/audio/voiceLines';
import { timelineOf } from '@studio/engine/sync/timelineOf';
import { tokensOf, type VoiceMedia } from '@studio/engine/sync/words';
import video from '../video';

const clipFile = (name: string) => fileURLToPath(new URL('../voice/clips/' + name, import.meta.url));
const readJson = (name: string) => existsSync(clipFile(name)) ? JSON.parse(readFileSync(clipFile(name), 'utf8')) : {};

const MEDIA: VoiceMedia = { lengths: readJson('durations.json'), words: readJson('words.json') };
const hasWords = Object.keys(MEDIA.words).length > 0;

describe('sync timeline', () => {
  it('builds: every action finds its beat and every anchor its word', () => {
    expect(() => timelineOf(video, MEDIA)).not.toThrow();
  });

  /** Pins the voice-only timeline as the pre-sync builder made it. Update with `vitest -u` only when the script or the clips change on purpose. */
  it('with the actions taken out, equals the pre-sync timeline byte for byte', async () => {
    const tl = timelineOf({ script: video.script, cast: video.cast }, MEDIA);
    tl.chapters.forEach(ch => expect(ch.acts).toEqual({}));
    await expect(JSON.stringify(tl, (k, v) => k === 'acts' ? undefined : v, 1)).toMatchFileSnapshot('./__golden__/timeline.json');
  });

  it.skipIf(!hasWords)('has word times that fit the line of every clip', () => {
    const misfits = video.script.flatMap(ch => ch.beats).flatMap(b => voiceLines(b).map(l => {
      const tokens = tokensOf(spokenText(lineOf(b)!)).length, timed = MEDIA.words[l.clip]?.t.length;
      return timed === tokens ? '' : `${l.clip}: ${timed ?? 'no'} word times for ${tokens} words`;
    })).filter(Boolean);
    expect(misfits).toEqual([]);
  });
});
