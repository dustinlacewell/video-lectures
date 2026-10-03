/* Pure: the cold viewer's transcript. Every beat in play order with its time, speaker, and words. */

import type { Beat, Chapter } from '../shared/beats.ts';
import { clock } from '../shared/format.ts';
import type { Sheet } from './plan.ts';

export function transcript(chapters: Chapter[], beats: Beat[], sheets: Sheet[], fractions: number[], total: number): string {
  const head = [
    '# Transcript', '',
    'Runtime ' + clock(total) + '. ' + chapters.length + ' chapters, ' + beats.length + ' beats. Times count from the start of the video.',
    'Each beat appears on a contact sheet as frames at ' + fractions.map(function (f) { return Math.round(f * 100) + '%'; }).join(', ') + ' of the beat.', ''
  ];
  return head.concat(chapters.flatMap(function (ch) { return chapterBlock(ch, beats, sheets); })).join('\n') + '\n';
}

function chapterBlock(ch: Chapter, beats: Beat[], sheets: Sheet[]): string[] {
  const own = beats.filter(function (b) { return b.chapter === ch.id; });
  const files = sheets.filter(function (s) { return s.chapter.id === ch.id; }).map(function (s) { return s.file; });
  return [
    '## ' + (ch.index + 1) + '. ' + ch.id + (ch.title ? ' - ' + ch.title : '') + ' (' + clock(ch.start) + ' to ' + clock(ch.start + ch.dur) + ')',
    'Sheets: ' + (files.join(', ') || 'none'), ''
  ].concat(own.map(line), ['']);
}

/** One beat as one line. */
export function line(b: Beat): string {
  const at = '- [' + clock(b.start) + '] ';
  switch (b.kind) {
    case 'title': return at + 'TITLE CARD: ' + (b.text ?? '(untitled)');
    case 'card': return at + 'CARD (read aloud): ' + b.text;
    case 'visual': return at + '(no words, ' + b.dur.toFixed(1) + ' s)';
    case 'chorus': return at + b.speakers.map(upper).join(' + ') + ' (together): ' + b.text;
    default: return at + upper(b.speakers[0]) + ': ' + b.text;
  }
}

function upper(s: string): string { return s.toUpperCase(); }
