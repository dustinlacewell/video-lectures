/* Pure: the --twice check. Where to seek away to, and the report of frames whose two draws differ. */

import { beatAt, type Beat } from '../shared/beats.ts';
import { clock } from '../shared/format.ts';

/** One frame drawn twice: pixels that differ between the draws, out of all pixels. */
export interface Redraw { t: number; changed: number; pixels: number }

/** A time far from T to seek to between the two draws: half the video away. */
export function awayFrom(t: number, total: number): number {
  return total > 0 ? (t + total / 2) % total : 0;
}

export function nondeterministic(redraws: Redraw[]): Redraw[] {
  return redraws.filter(function (r) { return r.changed > 0; });
}

export function determinismMd(redraws: Redraw[], beats: Beat[], total: number): string {
  const bad = nondeterministic(redraws);
  const head = [
    '# Determinism', '',
    redraws.length + ' frames drawn twice. Between the two draws the page drew a time half the video away and ran two animation frames.',
    bad.length ? bad.length + ' frames differ. A frame that differs is not a pure function of time: scrubbing, export and the tools can show a different picture than playback.'
      : 'Every frame matched to the pixel.', ''
  ];
  if (!bad.length) return head.join('\n');
  return head.concat(['time | seconds | beat | pixels changed | share', '--- | --- | --- | --- | ---'], bad.map(function (r) {
    return clock(r.t) + ' | ' + r.t.toFixed(3) + ' | ' + (beatAt(beats, r.t)?.id ?? '') + ' | ' + r.changed + ' | ' + (100 * r.changed / Math.max(1, r.pixels)).toFixed(2) + '%';
  }), ['', 'Away time for a frame at T: (T + ' + clock(total / 2) + ') wrapped to the video length.', '']).join('\n');
}
