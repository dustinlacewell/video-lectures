/* contact-sheet: keyframe grids per chapter + a timestamped transcript, the cold viewer's input. */

import { join } from 'node:path';
import { numberList, parseCli } from '../shared/args.ts';
import { writeOut } from '../shared/output.ts';
import { withVideo, type Video } from '../shared/video.ts';
import { sheetHtml, type Frame, type SheetLayout } from './layout.ts';
import { frameTimes, sheetsOf, type Sheet } from './plan.ts';
import { transcript } from './transcript.ts';

const USAGE = `contact-sheet: frames of every beat on grid images, plus transcript.md.
  --at <list>          fractions of each beat to capture (default 0.1,0.5,0.9)
  --thumb <px>         thumbnail width (default 480)
  --per-row <n>        thumbnails per row (default: frames per beat, at most 4)
  --beats-per-sheet <n> beats on one image (default 4)`;

const { common, own } = parseCli(USAGE, {
  at: { type: 'string' }, thumb: { type: 'string' }, 'per-row': { type: 'string' }, 'beats-per-sheet': { type: 'string' }
});
const fractions = numberList((own.at as string) ?? '0.1,0.5,0.9');
const thumb = Number(own.thumb ?? 480);
const layout: SheetLayout = { thumbWidth: thumb, perRow: Number(own['per-row'] ?? Math.min(4, fractions.length)) };
const perSheet = Number(own['beats-per-sheet'] ?? 4);

await withVideo(common, {}, async function (v) {
  const sheets = sheetsOf(v.chapters, v.beats, perSheet);
  for (const sheet of sheets) await renderSheet(v, sheet);
  const md = writeOut(common.out, 'transcript.md', transcript(v.chapters, v.beats, sheets, fractions, v.total));
  console.log(sheets.length + ' sheets in ' + join(common.out, 'sheets') + '; transcript: ' + md);
});

async function renderSheet(v: Video, sheet: Sheet): Promise<void> {
  const frames: Frame[][] = [];
  for (const b of sheet.beats) {
    const row: Frame[] = [];
    for (const t of frameTimes(b, fractions)) row.push({ t: t, src: await v.session.frame(t, thumb) });
    frames.push(row);
  }
  const page = await v.session.page.context().newPage();
  try {
    await page.setContent(sheetHtml(sheet, frames, layout), { waitUntil: 'load' });
    writeOut(common.out, sheet.file, await page.locator('body').screenshot({ type: 'png' }));
  } finally {
    await page.close();
  }
}
