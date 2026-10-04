import { describe, expect, it } from 'vitest';
import { buildMeta } from '../src/meta';
import { buildTimeline, voiceDurations } from '../src/timeline';
import { CAST, SCRIPT } from './fixtures';

describe('buildMeta', () => {
  it('carries the slug through', () => {
    expect(buildMeta('x', SCRIPT).slug).toBe('x');
  });

  it('with no clips, matches buildTimeline\'s word-estimate total, exactly, with no rounding', () => {
    const tl = buildTimeline(SCRIPT);
    expect(buildMeta('x', SCRIPT).runtime).toBe(tl.total);
  });

  it('turns clip lengths into beat durations the same way the player does, cast pad included', () => {
    const clips = { 'physics.atoms': 2.1 };
    const want = buildTimeline(SCRIPT, voiceDurations(SCRIPT, clips, CAST), CAST);
    expect(buildMeta('x', SCRIPT, clips, CAST).runtime).toBe(want.total);
    expect(buildMeta('x', SCRIPT, clips, CAST).runtime).not.toBe(buildTimeline(SCRIPT).total);
  });

  it('titles each chapter: its own title, else its short name', () => {
    const chapters = buildMeta('x', SCRIPT).chapters;
    expect(chapters.map(c => c.title)).toEqual(['Title', 'Physics', 'Form']);
  });

  it('starts each chapter at its timeline start', () => {
    const tl = buildTimeline(SCRIPT);
    const chapters = buildMeta('x', SCRIPT).chapters;
    expect(chapters.map(c => c.start)).toEqual(tl.chapters.map(c => c.start));
  });
});
