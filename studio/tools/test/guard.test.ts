import { describe, expect, it } from 'vitest';
import { diffSamples, infoChanged, infoDigestInput, type Captured } from '../guard/compare.ts';
import { sha256 } from '../guard/hash.ts';
import { parsePorcelain } from '../guard/dirty.ts';
import { summaryLine, mismatchLines, type RunReport } from '../guard/report.ts';
import { sampleTimes, type GoldenSample } from '../guard/samples.ts';
import { BEATS, CHAPTERS, INFO } from './fixture.ts';

describe('sampleTimes', () => {
  it('includes each chapter start +-0.2s, every beat midpoint, and the last frame', () => {
    const samples = sampleTimes(CHAPTERS, BEATS, INFO.total, 4);
    const whys = samples.map((s) => s.why);
    expect(whys).toContain('chapter-start:zombie');
    expect(whys.filter((w) => w === 'chapter-start:zombie')).toHaveLength(2);
    expect(whys.some((w) => w.startsWith('beat-mid:'))).toBe(true);
    expect(whys).toContain('last');
    expect(samples[samples.length - 1].t).toBeCloseTo(INFO.total - 0.001, 6);
  });

  it('keeps every time inside [0, total) and sorted', () => {
    const samples = sampleTimes(CHAPTERS, BEATS, INFO.total, 4);
    samples.forEach((s) => { expect(s.t).toBeGreaterThanOrEqual(0); expect(s.t).toBeLessThan(INFO.total); });
    for (let i = 1; i < samples.length; i++) expect(samples[i].t).toBeGreaterThanOrEqual(samples[i - 1].t);
  });

  it('deduplicates times that land on the same instant', () => {
    const samples = sampleTimes(CHAPTERS, BEATS, INFO.total, 4);
    const keys = samples.map((s) => s.t.toFixed(3));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('infoDigestInput / infoChanged', () => {
  it('is the same string for the same info', () => {
    expect(infoDigestInput(INFO)).toBe(infoDigestInput(INFO));
  });

  it('changes when total changes', () => {
    const moved = { ...INFO, total: INFO.total + 1 };
    const base = infoDigestInput(INFO);
    expect(infoChanged(base, moved).changed).toBe(true);
    expect(infoChanged(base, INFO).changed).toBe(false);
  });

  it('changes when a beat start moves', () => {
    const base = infoDigestInput(INFO);
    const moved = { ...INFO, chapters: INFO.chapters.map((c, i) => i === 1 ? { ...c, beats: c.beats.map((b, j) => j === 1 ? [b[0], (b[1] as number) + 1, b[2], b[3]] as typeof b : b) } : c) };
    expect(infoChanged(base, moved).changed).toBe(true);
  });
});

describe('diffSamples', () => {
  const golden: GoldenSample[] = [{ t: 1, why: 'even', frame: 'aaa' }, { t: 2, why: 'even', frame: 'bbb' }];

  it('finds no mismatches when every hash matches', () => {
    const captured: Captured[] = [{ t: 1, why: '', frame: 'aaa' }, { t: 2, why: '', frame: 'bbb' }];
    expect(diffSamples(golden, captured)).toEqual([]);
  });

  it('reports a sample whose hash differs, with the golden why', () => {
    const captured: Captured[] = [{ t: 1, why: '', frame: 'aaa' }, { t: 2, why: '', frame: 'CHANGED' }];
    const mismatches = diffSamples(golden, captured);
    expect(mismatches).toEqual([{ t: 2, why: 'even', expected: 'bbb', actual: 'CHANGED' }]);
  });

  it('reports a golden sample with no matching captured time', () => {
    const captured: Captured[] = [{ t: 1, why: '', frame: 'aaa' }];
    const mismatches = diffSamples(golden, captured);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0].t).toBe(2);
  });
});

describe('sha256', () => {
  it('is deterministic and sensitive to a single byte', () => {
    const a = sha256(Buffer.from([1, 2, 3]));
    expect(sha256(Buffer.from([1, 2, 3]))).toBe(a);
    expect(sha256(Buffer.from([1, 2, 4]))).not.toBe(a);
  });
});

describe('report', () => {
  it('summarizes a clean run', () => {
    const r: RunReport = { slug: 'v', sampleCount: 60, mismatches: [], infoChanged: false, control: { ran: false, distinct: true }, seconds: 12.3 };
    expect(summaryLine(r)).toBe('v, 60 samples, 0 differ, 12.3s');
  });

  it('flags __info() changes and a failed control', () => {
    const r: RunReport = { slug: 'v', sampleCount: 1, mismatches: [], infoChanged: true, control: { ran: true, distinct: false }, seconds: 0.5 };
    expect(summaryLine(r)).toContain('__info() changed');
    expect(summaryLine(r)).toContain('control FAILED');
  });

  it('lists each mismatch with time, clock and why', () => {
    const lines = mismatchLines([{ t: 11.5, why: 'beat-mid:zombie.yes', expected: 'a', actual: 'b' }]);
    expect(lines).toEqual(['  t=11.500 (0:11.5) beat-mid:zombie.yes: frame hash differs']);
  });
});

describe('parsePorcelain', () => {
  const porcelain = ' M videos/v/golden/frames.json\n M videos/v/engine/camera.ts\n?? videos/v/golden/png/new.png\n';

  it('drops every path under the golden folder', () => {
    expect(parsePorcelain(porcelain, 'videos/v/golden')).toEqual(['videos/v/engine/camera.ts']);
  });

  it('keeps a changed file outside golden/ even when golden/ is also dirty', () => {
    const dirty = parsePorcelain(porcelain, 'videos/v/golden');
    expect(dirty).toContain('videos/v/engine/camera.ts');
    expect(dirty).not.toContain('videos/v/golden/frames.json');
  });

  it('ignores blank lines', () => {
    expect(parsePorcelain('\n\n', 'golden')).toEqual([]);
  });
});
