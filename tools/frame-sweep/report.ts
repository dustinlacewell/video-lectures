/* Pure: sweep ranges -> the JSON record and the markdown summary. */

import { beatAt, type Beat } from '../shared/beats.ts';
import { clock } from '../shared/format.ts';
import type { Range } from './ranges.ts';

export interface SweepSettings {
  step: number; margin: number; refWidth: number; minDur: number; canvas: { width: number; height: number }; samples: number;
  /** Draw calls recorded, all frames together. Zero text draws means the instrumentation saw nothing: the result is void. */
  seen: { text: number; image: number };
}

/** A range as reported: times, beat, and sizes in reference pixels (a refWidth-wide frame). */
export interface Finding {
  verdict: Range['verdict'];
  kind: Range['kind'];
  text: string;
  from: number;
  to: number;
  dur: number;
  beat?: string;
  edges: string[];
  /** How far past the edge (clipped) or into the margin (margin), in reference pixels. */
  depth: number;
  /** The worst moment and the box then, in reference pixels. */
  worstT: number;
  box: [number, number, number, number];
  /** Frame image of the worst moment, relative to the out folder, if one was written. */
  shot?: string;
}

export function findings(ranges: Range[], beats: Beat[], scale: number): Finding[] {
  return ranges.map(function (r) {
    const b = r.worst.box;
    return {
      verdict: r.verdict, kind: r.kind, text: r.text, from: r.from, to: r.to, dur: round(r.dur), beat: beatAt(beats, r.worst.t)?.id,
      edges: r.edges, depth: round(r.depth * scale), worstT: r.worst.t, box: [b.x0, b.y0, b.x1, b.y1].map(function (v) { return round(v * scale); }) as Finding['box']
    };
  });
}

export function markdown(fs: Finding[], briefCount: number, s: SweepSettings): string {
  const clipped = fs.filter(function (f) { return f.verdict === 'clipped'; }), margin = fs.filter(function (f) { return f.verdict === 'margin'; });
  return [
    '# Frame sweep', '',
    s.samples + ' frames, every ' + s.step + ' s. Canvas ' + s.canvas.width + 'x' + s.canvas.height + '; sizes below are pixels of a ' + s.refWidth + '-wide frame. Safe margin ' + s.margin + ' px.',
    'Recorded ' + s.seen.text + ' text draws and ' + s.seen.image + ' image draws.' + (s.seen.text ? '' : ' NO TEXT WAS RECORDED: the check did not run; see frame-sweep.md.'),
    '',
    '- Cut by the frame edge: ' + clipped.length + ' ranges.',
    '- Inside the safe margin: ' + margin.length + ' ranges.',
    '- Ignored as brief slides (under ' + s.minDur + ' s): ' + briefCount + '.',
    '', '## Cut by the frame edge', '', ...listOf(clipped), '', '## Inside the safe margin', '', ...listOf(margin), ''
  ].join('\n');
}

function listOf(fs: Finding[]): string[] {
  if (!fs.length) return ['None.'];
  return fs.map(function (f) {
    return '- ' + clock(f.from) + ' to ' + clock(f.to) + ' (' + f.dur + ' s) ' + (f.beat ?? '?') + ': ' + f.kind + ' "' + short(f.text) + '", ' +
      f.edges.join('+') + ' by ' + f.depth + ' px at ' + clock(f.worstT) + (f.shot ? '. Frame: ' + f.shot : '');
  });
}

function short(s: string): string { return s.length > 60 ? s.slice(0, 57) + '...' : s; }
function round(x: number): number { return Math.round(x * 100) / 100; }
