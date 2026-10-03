import { describe, expect, it } from 'vitest';
import { chartHtml, maxNice } from '../pacing-curve/chart.ts';
import { beatsCsv, chaptersCsv } from '../pacing-curve/csv.ts';
import { beatRows, chapterRows, speechOf } from '../pacing-curve/metrics.ts';
import { summary } from '../pacing-curve/summary.ts';
import { changedShare, visualCurve } from '../pacing-curve/visual.ts';
import { BEATS, CHAPTERS } from './fixture.ts';

const CLIPS = { 'zombie.ask': 2.5, 'zombie.yes.you': 1.5, 'zombie.yes.zombie': 1.5, 'zombie.toe': 0.8, 'zombie.claim': 3 };

describe('visual', () => {
  it('measures the share of changed pixels', () => {
    expect(changedShare([0, 0, 0, 0], [0, 50, 5, 0], 12)).toBe(0.25);
  });

  it('adds up slow drift against the last change frame', () => {
    const frames = [0, 1, 2, 3, 4].map((k) => ({ t: k, grey: [k * 5, 0, 0, 0] }));
    const curve = visualCurve(frames, { delta: 12, share: 0.25 });
    expect(curve.map((s) => s.since)).toEqual([0, 1, 2, 0, 1]);
  });
});

describe('metrics', () => {
  const visual = visualCurve([7.4, 8, 9, 10, 11].map((t) => ({ t, grey: [0] })));
  const rows = beatRows(BEATS, CLIPS, visual, 0.03);
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

  it('measures speech from staggered clips', () => {
    expect(speechOf(BEATS[3], CLIPS)).toBe(1.75);
    expect(speechOf(BEATS[3], {})).toBe(0);
  });

  it('measures silence before each spoken line', () => {
    expect(byId['zombie.ask'].gap).toBe(7.4);
    expect(byId['zombie.yes'].gap).toBeCloseTo(11 - 9.9);
    expect(byId['intro.t'].gap).toBeUndefined();
  });

  it('measures words per second and stillness', () => {
    expect(byId['zombie.ask'].wps).toBeCloseTo(7 / 3.6);
    expect(byId['zombie.ask'].still).toBeCloseTo(2.6);
  });

  it('totals chapters with runtime shares', () => {
    const ch = chapterRows(CHAPTERS, rows);
    expect(ch.map((c) => c.share)).toEqual([4 / 26, 22 / 26]);
    expect(ch[1].words).toBe(7 + 2 + 1 + 5);
  });

  it('writes CSV, summary and chart', () => {
    expect(beatsCsv(rows).split('\n')[3]).toBe('zombie,zombie.ask,narration,7.40,3.60,7,1.94,2.50,7.40,2.6,1');
    expect(chaptersCsv(chapterRows(CHAPTERS, rows))).toContain('zombie,Meet your zombie twin,4.00,22.00,84.6,5,15,0.68');
    expect(summary(chapterRows(CHAPTERS, rows), rows)).toContain('- zombie.ask at 0:07.4: 7.40 s');
    const html = chartHtml('Pacing', chapterRows(CHAPTERS, rows), rows, visual);
    expect(html.match(/<svg /g)).toHaveLength(3);
    expect(html).toContain('<title>zombie.ask (narration) at 0:07.4: 1.94 words/s');
  });

  it('rounds axis tops', () => {
    expect([0, 0.7, 1.9, 4.1, 7, 12].map(maxNice)).toEqual([1, 1, 2, 5, 10, 20]);
  });
});
