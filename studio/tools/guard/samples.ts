/* Pure: the pinned times a guard samples, and the golden's declared shape. */

import type { Beat, Chapter } from '../shared/beats.ts';

/** Why a time was picked: 'even' spacing, a chapter boundary, a beat's midpoint, or the last frame. */
export type SampleWhy = 'even' | 'chapter-start' | 'beat-mid' | 'last';

export interface Sample { t: number; why: string }

/** One golden entry: the time, why it was picked, and the frame's pixel hash. */
export interface GoldenSample extends Sample { frame: string }

export interface Golden {
  blessedAt: string;
  commit: string;
  libraryHash: string;
  info: string;
  samples: GoldenSample[];
}

/** About 60 times: evenly spaced fill, each chapter start +-0.2s, every beat midpoint, and the last frame.
    Deduplicated and sorted; each kept inside [0, total). */
export function sampleTimes(chapters: Chapter[], beats: Beat[], total: number, evenCount = 40): Sample[] {
  const picks: Sample[] = [];
  for (let i = 0; i < evenCount; i++) picks.push({ t: 0.37 + (i * (total - 1)) / evenCount, why: 'even' });
  chapters.forEach(function (c, i) {
    if (i) { picks.push({ t: c.start - 0.2, why: 'chapter-start:' + c.id }); picks.push({ t: c.start + 0.2, why: 'chapter-start:' + c.id }); }
  });
  beats.forEach(function (b) { picks.push({ t: b.start + b.dur / 2, why: 'beat-mid:' + b.id }); });
  picks.push({ t: total - 0.001, why: 'last' });
  return dedupe(picks.filter(function (s) { return s.t >= 0 && s.t < total; }));
}

/** Keep one sample per time (3-decimal key), first why wins; sorted by time. */
function dedupe(picks: Sample[]): Sample[] {
  const byT = new Map<string, Sample>();
  picks.forEach(function (s) { const k = s.t.toFixed(3); if (!byT.has(k)) byT.set(k, s); });
  return Array.from(byT.values()).sort(function (a, b) { return a.t - b.t; });
}
