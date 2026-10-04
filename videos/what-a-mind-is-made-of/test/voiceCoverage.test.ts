import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildTimeline, voiceDurations } from '../engine/timeline';
import { voiceLines } from '../engine/audio/voiceLines';
import { SCRIPT } from '../script';
import { CAST } from '../script/cast';

const DURATIONS_PATH = fileURLToPath(new URL('../voice/clips/durations.json', import.meta.url));

/** The rendered clip lengths the player loads. `{}` before any clip exists. */
function loadClips(): Record<string, number> {
  if (!existsSync(DURATIONS_PATH)) return {};
  return JSON.parse(readFileSync(DURATIONS_PATH, 'utf8'));
}

const CLIPS = loadClips();
const hasClips = Object.keys(CLIPS).length > 0;

describe('rendered voice clips', () => {
  const tl = buildTimeline(SCRIPT, voiceDurations(SCRIPT, CLIPS, CAST));
  const beats = tl.chapters.flatMap(ch => ch.beats);

  it.skipIf(!hasClips)('has a length for every clip the script plays', () => {
    const missing = SCRIPT.flatMap(ch => ch.beats).flatMap(voiceLines).map(l => l.clip).filter(c => !CLIPS[c]);
    expect(missing).toEqual([]);
  });

  it.skipIf(!hasClips)('never ends a beat before one of its clips ends', () => {
    const short = beats.flatMap(b => b.lines
      .filter(l => l.at + CLIPS[l.clip] > b.dur)
      .map(l => `${l.clip}: ${l.at + CLIPS[l.clip]}s in a ${b.dur}s beat`));
    expect(short).toEqual([]);
  });

  if (!hasClips) {
    it('skips: no voice clips rendered yet (voice/clips/durations.json is empty or absent)', () => {
      expect(hasClips).toBe(false);
    });
  }
});
