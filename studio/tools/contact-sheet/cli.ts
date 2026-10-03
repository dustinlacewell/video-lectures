/* contact-sheet: keyframe grids per chapter + a timestamped transcript, the cold viewer's input. */

import { join } from 'node:path';
import { EXIT, exitUsage, numberList, parseCli } from '../shared/args.ts';
import { clock } from '../shared/format.ts';
import { writeOut } from '../shared/output.ts';
import { withFlag } from '../shared/url.ts';
import { withVideo, type Video } from '../shared/video.ts';
import { awayFrom, determinismMd, nondeterministic, type Redraw } from './determinism.ts';
import { sheetHtml, type Frame, type SheetLayout } from './layout.ts';
import { sheetsOf, sheetTimes, timeSheets, type Sheet } from './plan.ts';
import { transcript } from './transcript.ts';

const USAGE = `contact-sheet: frames of every beat on grid images, plus transcript.md.
  --at <list>           fractions of each beat to capture (default 0.1,0.5,0.9)
  --times <list>        exact moments in seconds from video start, instead of --at (e.g. 12.5,63,63.95)
  --twice               draw each captured frame twice (seeking away between) and report frames that differ; exit 3 if any
  --purpose             load the page with ?purpose, so the animatic's purpose band shows. Director's review only:
                        such sheets must never go to a cold viewer
  --thumb <px>          thumbnail width (default 480)
  --per-row <n>         thumbnails per row (default: frames per beat, at most 4)
  --beats-per-sheet <n> beats on one image (default 4)`;

const PURPOSE_BANNER = 'DIRECTOR ONLY: purpose band visible. Never give these sheets to a cold viewer.';

const { common, own } = parseCli(USAGE, {
  at: { type: 'string' }, times: { type: 'string' }, twice: { type: 'boolean' }, purpose: { type: 'boolean' },
  thumb: { type: 'string' }, 'per-row': { type: 'string' }, 'beats-per-sheet': { type: 'string' }
});
if (own.at !== undefined && own.times !== undefined) exitUsage(USAGE, EXIT.USAGE, '--at and --times do not mix: pick one.');
const fractions = numberList((own.at as string) ?? '0.1,0.5,0.9');
const times = own.times === undefined ? undefined : numberList(own.times as string);
if (times && !times.length) exitUsage(USAGE, EXIT.USAGE, '--times needs seconds, e.g. --times 12.5,63');
const thumb = Number(own.thumb ?? 480), perSheet = Number(own['beats-per-sheet'] ?? 4), purpose = own.purpose === true;
const perRow = own['per-row'] === undefined ? undefined : Number(own['per-row']);
const banner = purpose ? PURPOSE_BANNER : undefined;
if (purpose) console.warn('WARNING: --purpose is on. ' + PURPOSE_BANNER);

/** The purpose band shows only with ?purpose; strip it unless asked, whatever --url carried. */
function pageUrl(url: string): string { return withFlag(url, 'purpose', purpose); }

await withVideo(common, { pageUrl: pageUrl }, async function (v) {
  const sheets = planSheets(v);
  for (const sheet of sheets) await renderSheet(v, sheet);
  const outputs = [sheets.length + ' sheets in ' + join(common.out, 'sheets')];
  if (!times) outputs.push('transcript: ' + writeOut(common.out, 'transcript.md', transcript(v.chapters, v.beats, sheets, fractions, v.total, banner)));
  if (own.twice) outputs.push(await checkTwice(v, sheetTimes(sheets)));
  console.log(outputs.join('; '));
});

function planSheets(v: Video): Sheet[] {
  if (!times) return sheetsOf(v.chapters, v.beats, perSheet, fractions);
  const plan = timeSheets(v.chapters, v.beats, times, perSheet);
  if (plan.outside.length) console.warn('skipped, not in ' + (common.chapters.length ? 'the chosen chapters' : 'the video (0 to ' + clock(v.total) + ')') + ': ' + plan.outside.join(', '));
  return plan.sheets;
}

async function renderSheet(v: Video, sheet: Sheet): Promise<void> {
  const frames: Frame[][] = [];
  for (const row of sheet.times) {
    const cells: Frame[] = [];
    for (const t of row) cells.push({ t: t, src: await v.session.frame(t, thumb) });
    frames.push(cells);
  }
  const layout: SheetLayout = { thumbWidth: thumb, perRow: perRow ?? widest(sheet), banner: banner };
  const page = await v.session.page.context().newPage();
  try {
    await page.setContent(sheetHtml(sheet, frames, layout), { waitUntil: 'load' });
    writeOut(common.out, sheet.file, await page.locator('body').screenshot({ type: 'png' }));
  } finally {
    await page.close();
  }
}

/** Thumbnails per row: the most frames any beat on the sheet has, at most 4. */
function widest(sheet: Sheet): number {
  return Math.max(1, Math.min(4, ...sheet.times.map(function (r) { return r.length; })));
}

/** Draw every captured time twice; write determinism.md; fail the run if any frame differs. */
async function checkTwice(v: Video, ts: number[]): Promise<string> {
  const redraws: Redraw[] = [];
  for (const t of ts) redraws.push({ t: t, ...await v.session.redraw(t, awayFrom(t, v.total)) });
  const md = writeOut(common.out, 'determinism.md', determinismMd(redraws, v.allBeats, v.total));
  const bad = nondeterministic(redraws);
  if (bad.length) process.exitCode = EXIT.CHECK_FAILED;
  return (bad.length ? bad.length + ' of ' + redraws.length + ' frames NOT deterministic' : 'all ' + redraws.length + ' frames deterministic') + ': ' + md;
}
