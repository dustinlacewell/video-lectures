/* Pure: pacing rows -> CSV text. */

import { num } from '../shared/format.ts';
import type { BeatRow, ChapterRow } from './metrics.ts';
import type { VisualSample } from './visual.ts';

export function beatsCsv(rows: BeatRow[]): string {
  const head = 'chapter,beat,kind,start,dur,words,words_per_s,speech_s,gap_s,max_still_s,visual_changes';
  return [head].concat(rows.map(function (r) {
    return [r.chapter, r.id, r.kind, num(r.start), num(r.dur), r.words, num(r.wps), num(r.speech), r.gap === undefined ? '' : num(r.gap), num(r.still, 1), r.changes].map(cell).join(',');
  })).join('\n') + '\n';
}

export function chaptersCsv(rows: ChapterRow[]): string {
  const head = 'chapter,title,start,dur,share_pct,beats,words,words_per_s,speech_s,max_still_s';
  return [head].concat(rows.map(function (r) {
    return [r.id, r.title ?? '', num(r.start), num(r.dur), num(r.share * 100, 1), r.beats, r.words, num(r.wps), num(r.speech), num(r.still, 1)].map(cell).join(',');
  })).join('\n') + '\n';
}

export function visualCsv(samples: VisualSample[]): string {
  return ['t,changed_share,since_change_s'].concat(samples.map(function (s) { return [num(s.t), num(s.change, 4), num(s.since, 1)].join(','); })).join('\n') + '\n';
}

function cell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
