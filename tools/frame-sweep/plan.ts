/* Pure: the moments the sweep samples. */

import type { Chapter } from '../shared/beats.ts';

export interface Sample { t: number; step: number }

/** Every `step` seconds through each chapter. `perChapter` overrides the step for named chapters. */
export function sweepTimes(chapters: Chapter[], step: number, perChapter: Record<string, number> = {}): Sample[] {
  return chapters.flatMap(function (ch) {
    const s = perChapter[ch.id] ?? step, n = Math.max(1, Math.ceil(ch.dur / s - 1e-9)), out: Sample[] = [];
    for (let k = 0; k < n; k++) out.push({ t: round(ch.start + k * s), step: s });
    return out;
  });
}

/** ["zombie=0.05"] -> { zombie: 0.05 }. */
export function parseChapterSteps(list: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  list.forEach(function (s) {
    const [id, v] = s.split('=');
    if (!id || !(Number(v) > 0)) throw new Error('bad --chapter-step "' + s + '"; use <chapter>=<seconds>');
    out[id] = Number(v);
  });
  return out;
}

function round(t: number): number { return Math.round(t * 1e6) / 1e6; }
