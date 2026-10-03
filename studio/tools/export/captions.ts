/* Pure: caption cues from the script and the voice placement, written as SRT and WebVTT. */

import type { Beat } from '../shared/beats.ts';
import type { ClipLengths } from '../shared/contract.ts';
import type { Placement } from './voice.ts';

export interface CaptionCue { start: number; end: number; text: string }

/** One cue line holds at most this many characters; one cue at most two lines. */
export const LINE_CHARS = 42;
const CUE_LINES = 2;

/** `text` is what counts toward the line length; `markup` is what is written, with <i> and </i>. */
interface Word { text: string; markup: string }

/** One cue per voiced beat: from its first clip start to its last clip end. Non-narrator lines carry the
    speaker name ("ZOMBIE: ..."), a chorus both names. Long lines split into sequential cues timed by word share. */
export function captionCues(beats: Beat[], ps: Placement[], lengths: ClipLengths, names: Record<string, string>): CaptionCue[] {
  const byBeat = new Map<string, Placement[]>();
  ps.forEach(function (p) { byBeat.set(p.beat, (byBeat.get(p.beat) ?? []).concat([p])); });
  return beats.flatMap(function (b) {
    const own = byBeat.get(b.id);
    if (!own || !b.text) return [];
    const start = Math.min(...own.map(function (p) { return p.t; }));
    const end = Math.max(...own.map(function (p) { return p.t + lengths[p.clip]; }));
    return splitCue(start, end, speakerLabel(b, names), words(b.text));
  });
}

/** "" for the narrator; "NAME: " or "YOU & ZOMBIE: " otherwise. */
function speakerLabel(b: Beat, names: Record<string, string>): string {
  if (b.kind !== 'character' && b.kind !== 'chorus') return '';
  return b.speakers.map(function (s) { return (names[s] ?? s).toUpperCase(); }).join(' & ') + ': ';
}

/** Words of a line. `*a b*` becomes <i>a b</i>; quote marks around the whole line go. */
export function words(text: string): Word[] {
  const t = text.trim(), quoted = /^["“‘'](.*)["”’']$/s.exec(t), body = quoted ? quoted[1].trim() : t;
  let open = false;
  const marked = body.replace(/\*/g, function () { open = !open; return open ? '<i>' : '</i>'; }) + (open ? '</i>' : '');
  return marked.split(/\s+/).map(function (m) { return { text: m.replace(/<\/?i>/g, ''), markup: m }; })
    .filter(function (w) { return w.text !== ''; });
}

function splitCue(start: number, end: number, label: string, ws: Word[]): CaptionCue[] {
  const head: Word[] = label ? [{ text: label.trim(), markup: label.trim() }] : [];
  const lines = balancedWrap(head.concat(ws)), groups: Word[][][] = [];
  for (let i = 0; i < lines.length; i += CUE_LINES) groups.push(lines.slice(i, i + CUE_LINES));
  const total = ws.length + head.length, out: CaptionCue[] = [];
  let used = 0, open = false;
  groups.forEach(function (g) {
    const n = g.reduce(function (s, l) { return s + l.length; }, 0);
    const a = start + (end - start) * used / total, z = start + (end - start) * (used + n) / total;
    used += n;
    out.push({ start: a, end: z, text: g.map(function (l) { const r = render(l, open); open = r.open; return r.text; }).join('\n') });
  });
  return out;
}

/** Lines of even length that fill whole cues: as many cues as a greedy wrap needs, two lines each,
    with the narrowest width that still fits. Avoids a last cue of two words. */
function balancedWrap(ws: Word[]): Word[][] {
  const greedy = wrap(ws, LINE_CHARS);
  if (greedy.length < 2) return greedy;
  const want = Math.ceil(greedy.length / CUE_LINES) * CUE_LINES;
  const chars = ws.reduce(function (s, w) { return s + w.text.length + 1; }, -1);
  for (let width = Math.ceil(chars / want); width < LINE_CHARS; width++) {
    const lines = wrap(ws, width);
    if (lines.length <= want) return lines;
  }
  return greedy;
}

/** Greedy wrap by plain length. A word longer than the line gets a line of its own. */
function wrap(ws: Word[], max: number): Word[][] {
  const lines: Word[][] = [];
  let line: Word[] = [], len = 0;
  ws.forEach(function (w) {
    const add = (line.length ? 1 : 0) + w.text.length;
    if (line.length && len + add > max) { lines.push(line); line = []; len = 0; }
    line.push(w); len += (line.length > 1 ? 1 : 0) + w.text.length;
  });
  if (line.length) lines.push(line);
  return lines;
}

/** One caption line. An italic run that crosses a line break is closed at the end and reopened on the next line. */
function render(line: Word[], openBefore: boolean): { text: string; open: boolean } {
  const body = line.map(function (w) { return w.markup; }).join(' ');
  let open = openBefore;
  body.replace(/<(\/?)i>/g, function (_, close: string) { open = !close; return ''; });
  const text = ((openBefore ? '<i>' : '') + body + (open ? '</i>' : '')).replace(/<i><\/i>/g, '');
  return { text: text, open: open };
}

export function srt(cues: CaptionCue[]): string {
  return cues.map(function (c, i) { return (i + 1) + '\n' + stamp(c.start, ',') + ' --> ' + stamp(c.end, ',') + '\n' + c.text + '\n'; }).join('\n');
}

export function vtt(cues: CaptionCue[]): string {
  return 'WEBVTT\n\n' + cues.map(function (c) { return stamp(c.start, '.') + ' --> ' + stamp(c.end, '.') + '\n' + c.text + '\n'; }).join('\n');
}

/** Seconds -> "hh:mm:ss,mmm" (or "." for VTT). */
export function stamp(t: number, sep: string): string {
  const ms = Math.round(Math.max(0, t) * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return two(h) + ':' + two(m) + ':' + two(s) + sep + String(ms % 1000).padStart(3, '0');
}

function two(n: number): string { return (n < 10 ? '0' : '') + n; }
