/* pacing-curve: per-beat pacing numbers (words/s, silences, visual stillness) -> CSV, a summary, and an HTML chart. */

import { parseCli } from '../shared/args.ts';
import type { Chapter } from '../shared/beats.ts';
import { writeOut } from '../shared/output.ts';
import type { Session } from '../shared/session.ts';
import { loadClipLengths } from '../shared/sources.ts';
import { withVideo } from '../shared/video.ts';
import { chartHtml } from './chart.ts';
import { beatsCsv, chaptersCsv, visualCsv } from './csv.ts';
import { beatRows, chapterRows } from './metrics.ts';
import { speakerRates, videoRate } from './rates.ts';
import { num } from '../shared/format.ts';
import { summary } from './summary.ts';
import { DEFAULT_RULE, visualCurve, type ChangeRule, type VisualSample } from './visual.ts';

const USAGE = `pacing-curve: words/s, silences and visual stillness per beat and chapter.
  --visual-step <s>    seconds between frames for the visual-change proxy (default 0.5)
  --delta <n>          grey levels a pixel must move to count as changed (default 12)
  --share <f>          share of pixels that must differ from the last change's frame (default 0.03)
  --title <text>       chart title (default "Pacing curve")`;

const { common, own } = parseCli(USAGE, {
  'visual-step': { type: 'string' }, delta: { type: 'string' }, share: { type: 'string' }, title: { type: 'string' }
});
const vstep = Number(own['visual-step'] ?? 0.5);
const rule: ChangeRule = { delta: Number(own.delta ?? DEFAULT_RULE.delta), share: Number(own.share ?? DEFAULT_RULE.share) };

await withVideo(common, {}, async function (v) {
  const clips = await loadClipLengths(v.session, common);
  const visual = await sampleVisual(v.session, v.chapters);
  const rows = beatRows(v.beats, clips, visual, rule.share), chapters = chapterRows(v.chapters, rows);
  const runtime = v.chapters.reduce(function (s, c) { return s + c.dur; }, 0);
  const rates = { video: videoRate(v.beats, runtime), speakers: speakerRates(v.beats, clips, runtime) };
  writeOut(common.out, 'beats.csv', beatsCsv(rows));
  writeOut(common.out, 'chapters.csv', chaptersCsv(chapters));
  writeOut(common.out, 'visual.csv', visualCsv(visual));
  const md = writeOut(common.out, 'pacing.md', summary(chapters, rows, rates));
  writeOut(common.out, 'pacing.html', chartHtml((own.title as string) ?? 'Pacing curve', chapters, rows, visual));
  console.log(rows.length + ' beats, ' + visual.length + ' visual samples, ' + Object.keys(clips).length + ' clip lengths. ' +
    num(rates.video.perRuntime) + ' spoken words per second of runtime. ' + md);
});

/** Small grey frames every `vstep` seconds, one curve per chapter (a chapter start counts as a change). */
async function sampleVisual(s: Session, chapters: Chapter[]): Promise<VisualSample[]> {
  const w = 160, h = Math.round(160 * s.canvas.height / s.canvas.width), out: VisualSample[] = [];
  for (const ch of chapters) {
    const frames: { t: number; grey: number[] }[] = [];
    for (let k = 0; k * vstep < ch.dur - 1e-9; k++) frames.push({ t: ch.start + k * vstep, grey: await s.grey(ch.start + k * vstep, w, h) });
    out.push(...visualCurve(frames, rule));
  }
  return out;
}
