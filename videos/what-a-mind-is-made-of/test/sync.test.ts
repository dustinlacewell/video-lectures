import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildTimeline, voiceDurations } from '@studio/engine/timeline';
import video from '../video';

const clipFile = (name: string) => fileURLToPath(new URL('../voice/clips/' + name, import.meta.url));
const readJson = (name: string) => existsSync(clipFile(name)) ? JSON.parse(readFileSync(clipFile(name), 'utf8')) : {};

const LENGTHS: Record<string, number> = readJson('durations.json');

describe('timeline golden', () => {
  it('equals the timeline built before the sync engine', async () => {
    const tl = buildTimeline(video.script, voiceDurations(video.script, LENGTHS, video.cast), video.cast);
    await expect(JSON.stringify(tl, null, 1)).toMatchFileSnapshot('./__golden__/timeline.json');
  });
});
