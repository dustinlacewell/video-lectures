import { describe, expect, it } from 'vitest';
import { classify, overflow, type DrawnBox } from '../frame-sweep/classify.ts';
import { parseChapterSteps, sweepTimes } from '../frame-sweep/plan.ts';
import { hitsOf, mergeRanges } from '../frame-sweep/ranges.ts';
import { findings, markdown } from '../frame-sweep/report.ts';
import { BEATS, CHAPTERS } from './fixture.ts';

const F = { w: 1000, h: 500, margin: 10 };
const text = (x0: number, y0: number, x1: number, y1: number, t = 'label'): DrawnBox => ({ kind: 'text', text: t, x0, y0, x1, y1 });

describe('classify', () => {
  it('tells inside, margin, clipped and outside apart', () => {
    expect(classify(text(100, 100, 200, 120), F)).toBe('inside');
    expect(classify(text(5, 100, 200, 120), F)).toBe('margin');
    expect(classify(text(-20, 100, 80, 120), F)).toBe('clipped');
    expect(classify(text(900, 480, 1010, 495), F)).toBe('clipped');
    expect(classify(text(-200, 100, -10, 120), F)).toBe('outside');
    expect(classify(text(100, 501, 200, 520), F)).toBe('outside');
  });

  it('ignores sub-pixel touches of the edge', () => {
    expect(classify(text(-0.3, 100, 80, 120), F)).toBe('margin');
  });

  it('treats frame-sized images as backdrops', () => {
    expect(classify({ kind: 'image', text: 'bg', x0: -50, y0: 0, x1: 950, y1: 100 }, F)).toBe('backdrop');
    expect(classify({ kind: 'image', text: 'prop', x0: -50, y0: 0, x1: 50, y1: 100 }, F)).toBe('clipped');
  });

  it('reports the edges crossed and the depth', () => {
    expect(overflow(text(-20, -5, 80, 120), F, 0)).toEqual({ edges: ['left', 'top'], depth: 20 });
  });
});

describe('ranges', () => {
  const at = (t: number, box: DrawnBox) => hitsOf(t, 0.1, [box], F);

  it('merges consecutive samples of one text and splits on a gap', () => {
    const hits = [0, 0.1, 0.2, 0.3, 0.4, 1.0, 1.1, 1.2, 1.3, 1.4].flatMap((t) => at(t, text(-5, 100, 50, 120)));
    const { kept } = mergeRanges(hits, 0.4);
    expect(kept.map((r) => [r.from, r.to, Math.round(r.dur * 10) / 10])).toEqual([[0, 0.4, 0.5], [1.0, 1.4, 0.5]]);
  });

  it('drops brief slides through the edge', () => {
    const hits = [0, 0.1].flatMap((t) => at(t, text(-5, 100, 50, 120)));
    const r = mergeRanges(hits, 0.4);
    expect(r.kept).toHaveLength(0);
    expect(r.brief).toHaveLength(1);
  });

  it('keeps the worst verdict and deepest sample', () => {
    const hits = [...at(0, text(5, 100, 50, 120)), ...at(0.1, text(-30, 100, 50, 120)), ...at(0.2, text(5, 100, 50, 120)), ...at(0.3, text(5, 100, 50, 120))];
    const [r] = mergeRanges(hits, 0.4).kept;
    expect(r.verdict).toBe('clipped');
    expect(r.depth).toBe(30);
    expect(r.worst.t).toBe(0.1);
  });

  it('reports times, beat and reference-pixel sizes', () => {
    const hits = [7.5, 7.6, 7.7, 7.8].flatMap((t) => at(t, text(-20, 100, 50, 120, 'hey')));
    const fs = findings(mergeRanges(hits, 0.4).kept, BEATS, 2);
    expect(fs[0]).toMatchObject({ verdict: 'clipped', text: 'hey', beat: 'zombie.ask', depth: 40, box: [-40, 200, 100, 240] });
    const md = markdown(fs, 0, { step: 0.1, margin: 16, refWidth: 1280, minDur: 0.4, canvas: { width: 640, height: 360 }, samples: 4, seen: { text: 4, image: 0 } });
    expect(md).toContain('- Cut by the frame edge: 1 ranges.');
    expect(md).toContain('zombie.ask: text "hey", left by 40 px');
  });

  it('says loudly when no text was recorded', () => {
    const md = markdown([], 0, { step: 0.1, margin: 16, refWidth: 1280, minDur: 0.4, canvas: { width: 640, height: 360 }, samples: 4, seen: { text: 0, image: 0 } });
    expect(md).toContain('NO TEXT WAS RECORDED');
  });
});

describe('plan', () => {
  it('samples each chapter at its step', () => {
    const ts = sweepTimes(CHAPTERS, 1, { zombie: 11 });
    expect(ts.map((s) => s.t)).toEqual([0, 1, 2, 3, 4, 15]);
    expect(ts[5].step).toBe(11);
  });

  it('parses chapter steps', () => {
    expect(parseChapterSteps(['zombie=0.05'])).toEqual({ zombie: 0.05 });
    expect(() => parseChapterSteps(['zombie'])).toThrow();
  });
});
