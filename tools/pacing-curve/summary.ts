/* Pure: the few pacing facts a critic reads first, as markdown. */

import { clock, num } from '../shared/format.ts';
import type { BeatRow, ChapterRow } from './metrics.ts';

export function summary(chapters: ChapterRow[], rows: BeatRow[], top = 5): string {
  const spoken = rows.filter(function (r) { return r.words > 0; });
  const byWps = spoken.slice().sort(function (a, b) { return b.wps - a.wps; });
  const stills = rows.slice().sort(function (a, b) { return b.still - a.still; }).slice(0, top);
  const gaps = rows.filter(function (r) { return r.gap !== undefined; }).sort(function (a, b) { return b.gap! - a.gap!; }).slice(0, top);
  return [
    '# Pacing', '',
    '## Chapters', '',
    'chapter | length | share | words/s | longest still',
    '--- | --- | --- | --- | ---',
    ...chapters.map(function (c) { return c.id + ' | ' + clock(c.dur) + ' | ' + num(c.share * 100, 1) + '% | ' + num(c.wps) + ' | ' + num(c.still, 1) + ' s'; }),
    '', '## Densest beats (words/s)', '', ...byWps.slice(0, top).map(beat),
    '', '## Sparsest spoken beats (words/s)', '', ...byWps.slice(-top).reverse().map(beat),
    '', '## Longest time without a visual change', '', ...stills.map(function (r) { return '- ' + r.id + ' at ' + clock(r.start) + ': ' + num(r.still, 1) + ' s'; }),
    '', '## Longest silences before a line', '', ...gaps.map(function (r) { return '- ' + r.id + ' at ' + clock(r.start) + ': ' + num(r.gap!) + ' s'; }),
    ''
  ].join('\n');
}

function beat(r: BeatRow): string {
  return '- ' + r.id + ' (' + r.kind + ') at ' + clock(r.start) + ': ' + num(r.wps) + ' words/s, ' + r.words + ' words in ' + num(r.dur, 1) + ' s';
}
