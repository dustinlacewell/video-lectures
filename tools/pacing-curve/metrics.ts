/* Pure: per-beat and per-chapter pacing numbers. */

import type { Beat, BeatKind, Chapter } from '../shared/beats.ts';
import type { ClipLengths } from '../shared/contract.ts';
import type { VisualSample } from './visual.ts';

export interface BeatRow {
  chapter: string;
  id: string;
  kind: BeatKind;
  start: number;
  dur: number;
  words: number;
  /** Words per second of beat length. */
  wps: number;
  /** Seconds from the beat start to the end of its last clip; 0 when silent or a clip is missing. */
  speech: number;
  /** Seconds of silence between the previous spoken clip's end and this beat's first clip; empty when silent. */
  gap?: number;
  /** The longest time without a significant visual change seen at any sample in this beat. */
  still: number;
  /** Samples in this beat that count as a visual change. */
  changes: number;
}

export interface ChapterRow {
  id: string;
  title?: string;
  start: number;
  dur: number;
  /** Share of the measured runtime. */
  share: number;
  beats: number;
  words: number;
  wps: number;
  /** Sum of beats' speech seconds. */
  speech: number;
  still: number;
}

export function beatRows(beats: Beat[], clips: ClipLengths, visual: VisualSample[], changeShare: number): BeatRow[] {
  let lastSpeechEnd = 0;
  return beats.map(function (b) {
    const speech = speechOf(b, clips), firstAt = b.lines.length ? Math.min(...b.lines.map(function (l) { return l.at; })) : 0;
    const gap = speech > 0 ? Math.max(0, b.start + firstAt - lastSpeechEnd) : undefined;
    if (speech > 0) lastSpeechEnd = b.start + speech;
    const inside = visual.filter(function (s) { return s.t >= b.start && s.t < b.start + b.dur; });
    return {
      chapter: b.chapter, id: b.id, kind: b.kind, start: b.start, dur: b.dur, words: b.words, wps: b.dur > 0 ? b.words / b.dur : 0,
      speech: speech, gap: gap,
      still: inside.reduce(function (m, s) { return Math.max(m, s.since); }, 0),
      changes: inside.filter(function (s) { return s.change >= changeShare; }).length
    };
  });
}

/** End of the beat's last clip, from the beat start. 0 when it has no clips or any clip length is unknown. */
export function speechOf(b: Beat, clips: ClipLengths): number {
  if (!b.lines.length || b.lines.some(function (l) { return !clips[l.clip]; })) return 0;
  return Math.max(...b.lines.map(function (l) { return l.at + clips[l.clip]; }));
}

export function chapterRows(chapters: Chapter[], rows: BeatRow[]): ChapterRow[] {
  const runtime = chapters.reduce(function (s, c) { return s + c.dur; }, 0);
  return chapters.map(function (c) {
    const own = rows.filter(function (r) { return r.chapter === c.id; });
    const words = sum(own, 'words');
    return {
      id: c.id, title: c.title, start: c.start, dur: c.dur, share: runtime ? c.dur / runtime : 0, beats: own.length,
      words: words, wps: c.dur ? words / c.dur : 0, speech: sum(own, 'speech'),
      still: own.reduce(function (m, r) { return Math.max(m, r.still); }, 0)
    };
  });
}

function sum(rows: BeatRow[], k: 'words' | 'speech'): number {
  return rows.reduce(function (s, r) { return s + r[k]; }, 0);
}
