/* Pure helpers for the control bar: clock text, chapter labels, scrub-bar segments. */

import { chapterAt, type TimedChapter, type Timeline } from '../../timeline';

/** Seconds as m:ss. */
export function clock(s: number): string {
  s = Math.max(0, Math.floor(s));
  return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
}

/** The name a viewer sees for a chapter. The title chapter (index 0) has no number. */
export function chapterLabel(ch: TimedChapter): string {
  return ch.ci ? ch.ci + '. ' + (ch.title || ch.short) : ch.title || ch.short;
}

/** The chapters a viewer can jump to: every chapter after the title. */
export function menuChapters(tl: Timeline): TimedChapter[] {
  return tl.chapters.filter(function (ch) { return ch.ci > 0; });
}

/** One piece of the scrub track, as fractions of the whole video. */
export interface Segment { from: number; to: number }

/** One segment per menu chapter. The first one also covers the title, so the track starts at 0. */
export function segments(tl: Timeline): Segment[] {
  const chs = menuChapters(tl);
  return chs.map(function (ch, i) {
    const start = i ? ch.start : 0, end = i + 1 < chs.length ? chs[i + 1].start : tl.total;
    return { from: start / tl.total, to: end / tl.total };
  });
}

/** How much of a segment is played at position p (0..1 of the video). */
export function segmentFill(s: Segment, p: number): number {
  return Math.min(1, Math.max(0, (p - s.from) / (s.to - s.from)));
}

/** Tooltip text for a point on the track. */
export function pointLabel(tl: Timeline, T: number): { chapter: string; time: string } {
  return { chapter: chapterLabel(chapterAt(tl, T)), time: clock(T) };
}
