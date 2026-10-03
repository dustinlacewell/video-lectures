/* Pure: pacing rows -> one self-contained HTML page with inline SVG panels on a shared time axis. */

import { clock, num } from '../shared/format.ts';
import type { BeatRow, ChapterRow } from './metrics.ts';
import type { VisualSample } from './visual.ts';

interface Frame { x0: number; x1: number; t0: number; t1: number }

const WIDTH = 1200, LEFT = 56, RIGHT = 16, PANEL_H = 140, TOP = 28, BOTTOM = 28;

export function chartHtml(title: string, chapters: ChapterRow[], rows: BeatRow[], visual: VisualSample[]): string {
  const t0 = chapters.length ? chapters[0].start : 0, t1 = chapters.length ? chapters[chapters.length - 1].start + chapters[chapters.length - 1].dur : 1;
  const f: Frame = { x0: LEFT, x1: WIDTH - RIGHT, t0: t0, t1: t1 };
  const words = rows.reduce(function (s, r) { return s + r.words; }, 0), mean = (t1 - t0) > 0 ? words / (t1 - t0) : 0;
  const panels = [
    panel('Words per second, per beat', 'Dashed line: video mean ' + num(mean, 2) + ' words/s.', f, chapters, wpsMarks(rows, mean), maxOf(rows.map(function (r) { return r.wps; }))),
    panel('Seconds since the last visual change', 'Sampled every ' + stepOf(visual) + ' s.', f, chapters, stillMarks(visual), maxOf(visual.map(function (s) { return s.since; }))),
    panel('Silence before each spoken line (s)', 'One dot per spoken beat.', f, chapters, gapMarks(rows), maxOf(rows.map(function (r) { return r.gap ?? 0; })))
  ];
  return page(title, 'Runtime ' + clock(t1 - t0) + ', ' + chapters.length + ' chapters, ' + rows.length + ' beats, ' + words + ' words.', panels.join(''), table(chapters));
}

type Marks = (x: (t: number) => number, y: (v: number) => number) => string;

function panel(heading: string, note: string, f: Frame, chapters: ChapterRow[], marks: Marks, vmax: number): string {
  const top = maxNice(vmax), h = TOP + PANEL_H + BOTTOM;
  const x = function (t: number) { return f.x0 + (t - f.t0) / Math.max(1e-9, f.t1 - f.t0) * (f.x1 - f.x0); };
  const y = function (v: number) { return TOP + PANEL_H - Math.min(v, top) / top * PANEL_H; };
  return '<section><h2>' + heading + '</h2><p class="note">' + note + '</p>' +
    '<svg viewBox="0 0 ' + WIDTH + ' ' + h + '" role="img" aria-label="' + heading + '">' +
    bands(chapters, x) + yAxis(top, y, f) + xAxis(f, x) + marks(x, y) + '</svg></section>';
}

function bands(chapters: ChapterRow[], x: (t: number) => number): string {
  return chapters.map(function (c, i) {
    const a = x(c.start), b = x(c.start + c.dur), label = String(i + 1) + ' ' + c.id;
    const fits = label.length * 6.5 + 8 <= b - a;
    return '<g><title>' + esc(c.id + (c.title ? ': ' + c.title : '')) + ', ' + clock(c.dur) + '</title>' +
      '<rect class="band' + (i % 2) + '" x="' + a + '" y="' + 0 + '" width="' + (b - a) + '" height="' + (TOP + PANEL_H) + '"/>' +
      (fits ? '<text class="chap" x="' + (a + 4) + '" y="14">' + esc(label) + '</text>' : '') + '</g>';
  }).join('');
}

function yAxis(top: number, y: (v: number) => number, f: Frame): string {
  return [0, top / 2, top].map(function (v) {
    return '<line class="grid" x1="' + f.x0 + '" x2="' + f.x1 + '" y1="' + y(v) + '" y2="' + y(v) + '"/>' +
      '<text class="tick" x="' + (f.x0 - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + String(Math.round(v * 10) / 10) + '</text>';
  }).join('');
}

function xAxis(f: Frame, x: (t: number) => number): string {
  const span = f.t1 - f.t0, every = span > 600 ? 120 : span > 240 ? 60 : span > 60 ? 30 : 10, out: string[] = [];
  for (let t = Math.ceil(f.t0 / every) * every; t <= f.t1 + 1e-9; t += every) {
    out.push('<text class="tick" x="' + x(t) + '" y="' + (TOP + PANEL_H + 18) + '" text-anchor="middle">' + clock(t).replace(/\.0$/, '') + '</text>');
  }
  return out.join('');
}

function wpsMarks(rows: BeatRow[], mean: number): Marks {
  return function (x, y) {
    const bars = rows.map(function (r) {
      const a = x(r.start) + 1, b = x(r.start + r.dur) - 1, top = y(r.wps);
      return '<rect class="mark" x="' + a + '" y="' + top + '" width="' + Math.max(1, b - a) + '" height="' + (y(0) - top) + '"><title>' +
        esc(r.id + ' (' + r.kind + ') at ' + clock(r.start) + ': ' + num(r.wps) + ' words/s, ' + r.words + ' words in ' + num(r.dur, 1) + ' s') + '</title></rect>';
    }).join('');
    return bars + '<line class="mean" x1="' + LEFT + '" x2="' + (WIDTH - RIGHT) + '" y1="' + y(mean) + '" y2="' + y(mean) + '"/>';
  };
}

function stillMarks(visual: VisualSample[]): Marks {
  return function (x, y) {
    if (!visual.length) return '';
    const pts = visual.map(function (s) { return x(s.t) + ',' + y(s.since); }).join(' ');
    const hits = visual.map(function (s, i) {
      const a = x(s.t), b = i + 1 < visual.length ? x(visual[i + 1].t) : a + 2;
      return '<rect class="hit" x="' + a + '" y="' + TOP + '" width="' + Math.max(1, b - a) + '" height="' + PANEL_H + '"><title>' + clock(s.t) + ': ' + num(s.since, 1) + ' s since a visual change</title></rect>';
    }).join('');
    return '<polyline class="line" points="' + pts + '"/>' + hits;
  };
}

function gapMarks(rows: BeatRow[]): Marks {
  return function (x, y) {
    return rows.filter(function (r) { return r.gap !== undefined; }).map(function (r) {
      return '<circle class="dot" cx="' + x(r.start) + '" cy="' + y(r.gap!) + '" r="4"><title>' + esc(r.id + ' at ' + clock(r.start) + ': ' + num(r.gap!) + ' s of silence before it') + '</title></circle>';
    }).join('');
  };
}

function table(chapters: ChapterRow[]): string {
  const head = '<tr><th>#</th><th>Chapter</th><th>Start</th><th>Length</th><th>Share</th><th>Beats</th><th>Words</th><th>Words/s</th><th>Longest still (s)</th></tr>';
  const body = chapters.map(function (c, i) {
    return '<tr><td>' + (i + 1) + '</td><td>' + esc(c.id + (c.title ? ': ' + c.title : '')) + '</td><td>' + clock(c.start) + '</td><td>' + clock(c.dur) + '</td><td>' +
      num(c.share * 100, 1) + '%</td><td>' + c.beats + '</td><td>' + c.words + '</td><td>' + num(c.wps) + '</td><td>' + num(c.still, 1) + '</td></tr>';
  }).join('');
  return '<table>' + head + body + '</table>';
}

function page(title: string, sub: string, panels: string, tableHtml: string): string {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(title) + '</title><style>' + CSS + '</style></head><body>' +
    '<h1>' + esc(title) + '</h1><p class="sub">' + esc(sub) + '</p>' + panels + '<h2>Chapters</h2>' + tableHtml + '</body></html>';
}

function maxOf(vs: number[]): number { return vs.reduce(function (m, v) { return Math.max(m, v); }, 0); }

/** A round axis top at or above v. */
export function maxNice(v: number): number {
  if (!(v > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

function stepOf(visual: VisualSample[]): string {
  return visual.length > 1 ? num(visual[1].t - visual[0].t, 2).replace(/0+$/, '').replace(/\.$/, '') : '?';
}

function esc(s: string): string { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

const CSS = [
  ':root{--surface:#fcfcfb;--band:#f0efec;--ink:#0b0b0b;--ink2:#52514e;--grid:#e2e1dd;--series:#2a78d6}',
  '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--surface:#1a1a19;--band:#252524;--ink:#ffffff;--ink2:#c3c2b7;--grid:#333331;--series:#3987e5}}',
  ':root[data-theme="dark"]{--surface:#1a1a19;--band:#252524;--ink:#ffffff;--ink2:#c3c2b7;--grid:#333331;--series:#3987e5}',
  'body{margin:0;padding:16px;background:var(--surface);color:var(--ink);font:14px/1.4 system-ui,sans-serif;max-width:1232px}',
  'h1{font-size:20px;margin:0}h2{font-size:15px;margin:18px 0 0}.sub,.note{color:var(--ink2);margin:2px 0 4px}',
  'svg{width:100%;height:auto;display:block}',
  '.band0{fill:var(--surface)}.band1{fill:var(--band)}.chap{fill:var(--ink2);font-size:11px}',
  '.grid{stroke:var(--grid);stroke-width:1}.tick{fill:var(--ink2);font-size:11px}',
  '.mark{fill:var(--series)}.mark:hover,.dot:hover{opacity:.7}.line{fill:none;stroke:var(--series);stroke-width:2}',
  '.mean{stroke:var(--ink2);stroke-width:1;stroke-dasharray:4 3}.hit{fill:transparent}.hit:hover{fill:var(--grid);opacity:.5}',
  '.dot{fill:var(--series);stroke:var(--surface);stroke-width:2}',
  'table{border-collapse:collapse;margin-top:6px}th,td{padding:3px 10px;border-bottom:1px solid var(--grid);text-align:right}th:nth-child(2),td:nth-child(2){text-align:left}'
].join('');
