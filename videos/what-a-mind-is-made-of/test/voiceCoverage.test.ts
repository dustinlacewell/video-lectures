import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTimeline, voiceDurations } from '../engine/timeline';
import { voiceLines } from '../engine/audio/voiceLines';
import { SCRIPT } from '../script';
import { CAST } from '../script/cast';

/** The rendered clip lengths the player loads. */
const CLIPS: Record<string, number> = JSON.parse(readFileSync(new URL('../voice/clips/durations.json', import.meta.url), 'utf8'));

describe('rendered voice clips', () => {
  const tl = buildTimeline(SCRIPT, voiceDurations(SCRIPT, CLIPS, CAST));
  const beats = tl.chapters.flatMap(ch => ch.beats);

  it('has a length for every clip the script plays', () => {
    const missing = SCRIPT.flatMap(ch => ch.beats).flatMap(voiceLines).map(l => l.clip).filter(c => !CLIPS[c]);
    expect(missing).toEqual([]);
  });

  it('never ends a beat before one of its clips ends', () => {
    const short = beats.flatMap(b => b.lines
      .filter(l => l.at + CLIPS[l.clip] > b.dur)
      .map(l => `${l.clip}: ${l.at + CLIPS[l.clip]}s in a ${b.dur}s beat`));
    expect(short).toEqual([]);
  });
});
