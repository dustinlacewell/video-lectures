import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { beatDuration, buildTimeline, keyOf } from '../engine/timeline';
import { SCRIPT } from '../script';

/** Timeline and sound cues captured from the original single-file HTML (tools/parity.ts --write-fixture). */
const ORIGINAL = JSON.parse(readFileSync(new URL('./fixtures/original-timeline.json', import.meta.url), 'utf8')) as {
  total: number;
  chapters: { start: number; dur: number; beats: [string, number, number][] }[];
  cues: { t: number; type: string; arg?: number }[];
};

describe('buildTimeline against the original', () => {
  const tl = buildTimeline(SCRIPT);

  it('has the same total runtime', () => {
    expect(tl.total).toBe(ORIGINAL.total);
    expect(tl.total).toBe(582.36);
  });

  it('has the same chapter and beat start times and durations', () => {
    expect(tl.chapters.map(ch => ({ start: ch.start, dur: ch.dur, beats: ch.beats.map(b => [b.key, b.start, b.dur]) })))
      .toEqual(ORIGINAL.chapters);
  });

  it('has the same sound cues in the same order', () => {
    expect(tl.cues.map(q => ({ t: q.t, type: q.type, arg: q.arg }))).toEqual(ORIGINAL.cues);
  });

  it('opens each titled chapter with a title beat that holds the first beat camera', () => {
    tl.chapters.forEach((ch, i) => {
      if (!SCRIPT[i].title) { expect(ch.beats[0].chTitle).toBeUndefined(); return; }
      expect(ch.beats[0]).toMatchObject({ key: '_title', id: ch.id + '._title', chTitle: true, dur: 3.4, start: 0 });
      expect(ch.beats[0].cam).toBe(SCRIPT[i].beats[0].cam);
    });
  });
});

describe('beat ids', () => {
  it('are unique and prefixed by their chapter id', () => {
    const ids = SCRIPT.flatMap(ch => ch.beats.map(b => { expect(b.id.startsWith(ch.id + '.')).toBe(true); return b.id; }));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('rejects a beat id from another chapter', () => {
    expect(() => keyOf('physics', 'form.lever1')).toThrow();
    expect(keyOf('physics', 'physics.fall')).toBe('fall');
  });
});

describe('durations map', () => {
  const base = buildTimeline(SCRIPT);
  const physics = () => base.chapters.find(ch => ch.id === 'physics')!;

  it('overrides the word estimate and shifts everything after it', () => {
    const atoms = physics().beats.find(b => b.key === 'atoms')!;
    const tl = buildTimeline(SCRIPT, { 'physics.atoms': 2 });
    const ch = tl.chapters.find(c => c.id === 'physics')!;
    expect(ch.beats.find(b => b.key === 'atoms')!.dur).toBe(2);
    expect(ch.beats.find(b => b.key === 'laws')!.start).toBeCloseTo(atoms.start + 2, 9);
    expect(tl.total).toBeCloseTo(base.total - atoms.dur + 2, 9);
    expect(tl.chapters.find(c => c.id === 'form')!.start).toBeCloseTo(base.chapters.find(c => c.id === 'form')!.start - atoms.dur + 2, 9);
  });

  it('overrides a fixed script duration too', () => {
    const tl = buildTimeline(SCRIPT, { 'physics.spirit': 1.5 });
    expect(tl.chapters.find(c => c.id === 'physics')!.beats.find(b => b.key === 'spirit')!.dur).toBe(1.5);
  });

  it('moves the sound cues of later beats with the beats', () => {
    const tl = buildTimeline(SCRIPT, { 'physics.atoms': 2 });
    const delta = 2 - physics().beats.find(b => b.key === 'atoms')!.dur;
    const lawsStart = 6 + physics().beats.find(b => b.key === 'laws')!.start;
    const blip = (cues: typeof tl.cues) => cues.find(q => q.type === 'blip' && q.t > lawsStart + delta - 0.01)!.t;
    expect(blip(tl.cues)).toBeCloseTo(blip(base.cues) + delta, 9);
  });

  it('ignores ids it does not know', () => {
    expect(buildTimeline(SCRIPT, { 'nope.nothing': 99 }).total).toBe(base.total);
  });
});

describe('word-count fallback', () => {
  it('estimates captions at 2.2 s + 0.42 s per word, at least 4.6 s', () => {
    expect(beatDuration({ id: 'x.a', say: 'one two three' }, {})).toBe(4.6);
    const ten = 'a b c d e f g h i j';
    expect(beatDuration({ id: 'x.a', say: ten }, {})).toBeCloseTo(2.2 + 10 * 0.42, 12);
  });

  it('estimates cards at 3.0 s + 0.42 s per word', () => {
    expect(beatDuration({ id: 'x.a', card: 'four little words here' }, {})).toBeCloseTo(3.0 + 4 * 0.42, 12);
  });

  it('prefers a fixed duration over the estimate', () => {
    expect(beatDuration({ id: 'x.a', say: 'a b c d e f g h i j k l m n', dur: 3 }, {})).toBe(3);
  });

  it('gives an empty beat the minimum', () => {
    expect(beatDuration({ id: 'x.a' }, {})).toBe(4.6);
  });
});
