/* Pure: rich text written inline as `*word*` for italic. Lines stay plain strings with their markup,
   so every caller that passes text around keeps working; only measuring and drawing read the runs. */

export interface Run { text: string; italic: boolean }

/** Width of `text` in the given style. Injected so wrapping stays pure. */
export type Measure = (text: string, italic: boolean) => number;

/** An italic span: `*` + text that starts and ends with a non-space + `*`. A lone `*` stays literal. */
const SPAN = /\*(\S(?:[^*]*?\S)?)\*/g;

/** Split markup into style runs. Text without spans is one plain run. Empty runs are dropped. */
export function parseRuns(s: string): Run[] {
  const runs: Run[] = [];
  let at = 0;
  for (const m of s.matchAll(SPAN)) {
    push(runs, s.slice(at, m.index), false);
    push(runs, m[1], true);
    at = m.index + m[0].length;
  }
  push(runs, s.slice(at), false);
  return runs;
}

/** Runs back to markup. Inverse of parseRuns for runs it produced. */
export function toMarkup(runs: Run[]): string {
  return runs.map(function (r) { return r.italic ? '*' + r.text + '*' : r.text; }).join('');
}

export function runsWidth(runs: Run[], measure: Measure): number {
  let w = 0;
  runs.forEach(function (r) { w += measure(r.text, r.italic); });
  return w;
}

/** Wrap markup into lines no wider than maxW (a single long word may exceed it).
    Each line is markup again, with every span closed inside its word, so splitting a line on spaces
    yields words that are valid markup on their own. Plain text wraps exactly as a plain word wrap would. */
export function wrapMarkup(s: string, maxW: number, measure: Measure): string[] {
  const lines: Run[][] = [];
  let cur: Run[] = [];
  words(parseRuns(s)).forEach(function (w) {
    const t = isEmpty(cur) ? w : join(cur, w);
    if (runsWidth(t, measure) > maxW && !isEmpty(cur)) { lines.push(cur); cur = w; } else cur = t;
  });
  if (!isEmpty(cur)) lines.push(cur);
  return lines.map(function (l) { return words(l).map(toMarkup).join(' '); });
}

/** Split runs at spaces into words; a word may hold several runs ("*is*,"). Keeps empty words, like split(' '). */
function words(runs: Run[]): Run[][] {
  const out: Run[][] = [[]];
  runs.forEach(function (r) {
    r.text.split(' ').forEach(function (piece, i) {
      if (i > 0) out.push([]);
      push(out[out.length - 1], piece, r.italic);
    });
  });
  return out;
}

function join(a: Run[], b: Run[]): Run[] {
  const out = a.slice();
  push(out, ' ', false);
  b.forEach(function (r) { push(out, r.text, r.italic); });
  return out;
}

function isEmpty(runs: Run[]): boolean { return runs.length === 0; }

/** Append text, merging into the last run when the style matches. */
function push(runs: Run[], text: string, italic: boolean): void {
  if (!text) return;
  const last = runs[runs.length - 1];
  if (last && last.italic === italic) runs[runs.length - 1] = { text: last.text + text, italic: italic };
  else runs.push({ text: text, italic: italic });
}
