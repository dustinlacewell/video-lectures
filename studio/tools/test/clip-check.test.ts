import { describe, expect, it } from 'vitest';
import { checkClips, DEFAULT_RULES, noVoiceYetMessage } from '../clip-check/check.ts';
import { markdown } from '../clip-check/report.ts';
import { BEATS } from './fixture.ts';

describe('checkClips', () => {
  it('passes a well-timed video', () => {
    const clips = { 'zombie.ask': 3, 'zombie.yes.you': 2, 'zombie.yes.zombie': 2, 'zombie.toe': 4.4, 'zombie.claim': 4 };
    const r = checkClips(BEATS, BEATS, clips, undefined);
    expect(r).toMatchObject({ spoken: 4, missing: [], overflow: [], deadAir: [], overrides: [], orphans: [] });
  });

  it('finds missing, overflowing, dead-air, overriding and orphan clips', () => {
    const clips = { 'zombie.ask': 3.7, 'zombie.yes.you': 2, 'zombie.toe': 0.8, 'zombie.claim': 4, 'zombie.old': 2 };
    const r = checkClips(BEATS, BEATS, clips, ['zombie.ask', 'zombie.gone'], DEFAULT_RULES);
    expect(r.missing).toEqual([{ beat: 'zombie.yes', start: 11, clips: ['zombie.yes.zombie'] }]);
    expect(r.overflow.map((o) => [o.clip, Math.round(o.over * 10) / 10])).toEqual([['zombie.ask', 0.1]]);
    expect(r.deadAir.map((d) => d.beat)).toEqual(['zombie.toe']);
    expect(r.overrides.map((o) => [o.beat, Math.round(o.added * 10) / 10])).toEqual([['zombie.toe', 3.6]]);
    expect(r.orphans).toEqual(['zombie.old']);
    expect(r.unrendered).toEqual(['zombie.gone']);
    expect(r.notInManifest).toEqual(['zombie.claim', 'zombie.toe', 'zombie.yes.you', 'zombie.yes.zombie']);
  });

  it('tells orphans against the whole video, not the checked chapter', () => {
    const r = checkClips(BEATS.slice(0, 2), BEATS, { 'zombie.ask': 3 }, undefined);
    expect(r.orphans).toEqual([]);
  });

  it('writes a markdown report', () => {
    const r = checkClips(BEATS, BEATS, { 'zombie.ask': 3 }, undefined);
    const md = markdown(r, DEFAULT_RULES, 'durations.json', false);
    expect(md).toContain('- Missing clips: 3 beats.');
    expect(md).toContain('- zombie.yes at 0:11.0: zombie.yes.you, zombie.yes.zombie.');
    expect(md).not.toContain('manifest');
  });

  it('reports spoken beats and zero clips before voice exists', () => {
    expect(noVoiceYetMessage(BEATS)).toBe('no voice yet: 4 spoken beats, 0 clips');
  });
});
