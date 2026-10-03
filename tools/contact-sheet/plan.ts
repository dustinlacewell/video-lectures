/* Pure: which moments to capture, and how beats split into sheet images. */

import type { Beat, Chapter } from '../shared/beats.ts';
import { pad2, slug } from '../shared/format.ts';

export interface Sheet { chapter: Chapter; part: number; beats: Beat[]; file: string }

/** Capture times inside a beat at the given fractions of its length, kept inside the beat. */
export function frameTimes(b: Beat, fractions: number[]): number[] {
  const last = b.start + Math.max(0, b.dur - 0.001);
  return fractions.map(function (f) { return Math.min(last, Math.max(b.start, b.start + f * b.dur)); });
}

/** Each chapter's beats in sheets of at most `perSheet` beats, sizes balanced (10 beats at 4 -> 4, 3, 3).
    Named "<NN>-<chapter>-<part>.png", NN counting from 1 in play order. */
export function sheetsOf(chapters: Chapter[], beats: Beat[], perSheet: number): Sheet[] {
  return chapters.flatMap(function (ch) {
    const own = beats.filter(function (b) { return b.chapter === ch.id; });
    return balancedChunks(own, perSheet).map(function (chunk, i) {
      return { chapter: ch, part: i + 1, beats: chunk, file: 'sheets/' + pad2(ch.index + 1) + '-' + slug(ch.id) + '-' + (i + 1) + '.png' };
    });
  });
}

/** Split into the fewest chunks of at most `max`, with sizes differing by at most one, larger first. */
export function balancedChunks<T>(items: T[], max: number): T[][] {
  const n = Math.ceil(items.length / max), out: T[][] = [];
  let i = 0;
  for (let k = 0; k < n; k++) {
    const size = Math.floor(items.length / n) + (k < items.length % n ? 1 : 0);
    out.push(items.slice(i, i + size));
    i += size;
  }
  return out;
}
