/* Pure: which moments to capture, and how beats split into sheet images. */

import { beatAt, type Beat, type Chapter } from '../shared/beats.ts';
import { pad2, slug } from '../shared/format.ts';

/** One sheet image: a chapter's beats, and for each beat the times to capture. */
export interface Sheet { chapter: Chapter; part: number; beats: Beat[]; times: number[][]; file: string }

/** Capture times inside a beat at the given fractions of its length, kept inside the beat. */
export function frameTimes(b: Beat, fractions: number[]): number[] {
  const last = b.start + Math.max(0, b.dur - 0.001);
  return fractions.map(function (f) { return Math.min(last, Math.max(b.start, b.start + f * b.dur)); });
}

/** Each chapter's beats in sheets of at most `perSheet` beats, sizes balanced (10 beats at 4 -> 4, 3, 3),
    each beat captured at `fractions`. Named "<NN>-<chapter>-<part>.png", NN counting from 1 in play order. */
export function sheetsOf(chapters: Chapter[], beats: Beat[], perSheet: number, fractions: number[]): Sheet[] {
  return chaptered(chapters, beats, perSheet, 'sheets/', function (b) { return frameTimes(b, fractions); });
}

/** Sheets for exact moments: each time goes to the beat playing then; beats with no time are left out.
    Times outside `beats` (another chapter, or past the end) come back in `outside`. Named "times-<NN>-<chapter>-<part>.png". */
export function timeSheets(chapters: Chapter[], beats: Beat[], times: number[], perSheet: number): { sheets: Sheet[]; outside: number[] } {
  const byBeat = new Map<Beat, number[]>(), outside: number[] = [];
  times.slice().sort(function (a, b) { return a - b; }).forEach(function (t) {
    const b = beatAt(beats, t);
    if (!b || t >= b.start + b.dur) { outside.push(t); return; }
    byBeat.set(b, (byBeat.get(b) ?? []).concat([t]));
  });
  const hit = beats.filter(function (b) { return byBeat.has(b); });
  return { sheets: chaptered(chapters, hit, perSheet, 'sheets/times-', function (b) { return byBeat.get(b)!; }), outside: outside };
}

/** Every time on the sheets, in play order. */
export function sheetTimes(sheets: Sheet[]): number[] {
  return sheets.flatMap(function (s) { return s.times.flat(); });
}

function chaptered(chapters: Chapter[], beats: Beat[], perSheet: number, prefix: string, timesOf: (b: Beat) => number[]): Sheet[] {
  return chapters.flatMap(function (ch) {
    const own = beats.filter(function (b) { return b.chapter === ch.id; });
    return balancedChunks(own, perSheet).map(function (chunk, i) {
      return { chapter: ch, part: i + 1, beats: chunk, times: chunk.map(timesOf), file: prefix + pad2(ch.index + 1) + '-' + slug(ch.id) + '-' + (i + 1) + '.png' };
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
