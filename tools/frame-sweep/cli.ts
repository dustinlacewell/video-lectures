/* frame-sweep: step through the video and report text and images cut by the frame edge or inside the safe margin. */

import { parseCli } from '../shared/args.ts';
import { pad2 } from '../shared/format.ts';
import { pngBytes, writeOut } from '../shared/output.ts';
import { CANVAS_MARK, type Session } from '../shared/session.ts';
import { withVideo } from '../shared/video.ts';
import type { DrawnBox, FrameSpec } from './classify.ts';
import { INSTRUMENT } from './instrument.ts';
import { parseChapterSteps, sweepTimes, type Sample } from './plan.ts';
import { hitsOf, mergeRanges, type Hit } from './ranges.ts';
import { findings, markdown, type Finding } from './report.ts';

const USAGE = `frame-sweep: find drawn text and images cut by the frame edge or inside the safe margin.
  --step <s>              seconds between samples (default 0.1)
  --chapter-step <id=s>   a different step for one chapter; repeatable
  --margin <px>           safe margin in reference pixels (default 16)
  --ref-width <px>        width of the reference frame the margin is given in (default 1280)
  --min <s>               ignore ranges shorter than this: boxes sliding through an edge (default 0.4)
  --max-shots <n>         write a marked frame for at most n ranges, worst first (default 60)`;

const { common, own } = parseCli(USAGE, {
  step: { type: 'string' }, 'chapter-step': { type: 'string', multiple: true }, margin: { type: 'string' },
  'ref-width': { type: 'string' }, min: { type: 'string' }, 'max-shots': { type: 'string' }
});
const step = Number(own.step ?? 0.1), margin = Number(own.margin ?? 16), refWidth = Number(own['ref-width'] ?? 1280);
const minDur = Number(own.min ?? 0.4), maxShots = Number(own['max-shots'] ?? 60);
const chapterSteps = parseChapterSteps((own['chapter-step'] as string[] | undefined) ?? []);

await withVideo(common, { initScripts: [INSTRUMENT] }, async function (v) {
  const c = v.session.canvas, scale = refWidth / c.width;
  const frame: FrameSpec = { w: c.width, h: c.height, margin: margin / scale };
  const samples = sweepTimes(v.chapters, step, chapterSteps);
  const { hits, seen } = await sweep(v.session, samples, frame);
  const { kept, brief } = mergeRanges(hits, minDur);
  const fs = findings(kept, v.beats, scale);
  await writeShots(v.session, fs, scale);
  const settings = { step, margin, refWidth, minDur, canvas: c, samples: samples.length, seen: seen };
  writeOut(common.out, 'sweep.json', JSON.stringify({ settings: { ...settings, chapterSteps }, brief: brief.length, findings: fs }, null, 2) + '\n');
  const md = writeOut(common.out, 'sweep.md', markdown(fs, brief.length, settings));
  console.log(samples.length + ' frames, ' + seen.text + ' text draws, ' + seen.image + ' image draws; ' + fs.filter(isClipped).length + ' clipped, ' + fs.filter(function (f) { return !isClipped(f); }).length + ' in margin, ' + brief.length + ' brief ignored. ' + md);
});

type Seen = Record<DrawnBox['kind'], number>;

function isClipped(f: Finding): boolean { return f.verdict === 'clipped'; }

/** Draw each sample with recording on, in batches, and keep the boxes that cross an edge. */
async function sweep(s: Session, samples: Sample[], frame: FrameSpec): Promise<{ hits: Hit[]; seen: Seen }> {
  const hits: Hit[] = [], seen: Seen = { text: 0, image: 0 };
  for (let i = 0; i < samples.length; i += 50) {
    const batch = samples.slice(i, i + 50);
    const boxes = await s.page.evaluate(recordFrames, batch.map(function (x) { return x.t; }));
    batch.forEach(function (x, k) {
      boxes[k].forEach(function (b) { seen[b.kind]++; });
      hits.push(...hitsOf(x.t, x.step, boxes[k], frame));
    });
  }
  return { hits: hits, seen: seen };
}

/** Runs in the page: draw each time with the recorder on; return the boxes per time. */
function recordFrames(times: number[]): DrawnBox[][] {
  const w = window as any, rec = w.__vsSweep;
  return times.map(function (t) {
    rec.boxes = []; rec.on = true;
    try { w.__seek(t); } finally { rec.on = false; }
    return rec.boxes;
  });
}

/** For the worst ranges, a frame of the worst moment with the box outlined. */
async function writeShots(s: Session, fs: Finding[], scale: number): Promise<void> {
  const order = fs.slice().sort(function (a, b) { return (isClipped(b) ? 1 : 0) - (isClipped(a) ? 1 : 0) || b.depth - a.depth; }).slice(0, maxShots);
  for (const f of order) {
    const box = f.box.map(function (x) { return x / scale; });
    const url = await s.page.evaluate(markedFrame, { t: f.worstT, box: box, sel: '[' + CANVAS_MARK + ']', color: isClipped(f) ? '#ff2d2d' : '#ffb000' });
    f.shot = 'frames/' + pad2(fs.indexOf(f) + 1) + '.png';
    writeOut(common.out, f.shot, pngBytes(url));
  }
}

/** Runs in the page: the frame at t with a box outlined. */
function markedFrame(a: { t: number; box: number[]; sel: string; color: string }): string {
  (window as any).__seek(a.t);
  const src = document.querySelector(a.sel) as HTMLCanvasElement, out = document.createElement('canvas');
  out.width = src.width; out.height = src.height;
  const x = out.getContext('2d')!;
  x.drawImage(src, 0, 0);
  x.strokeStyle = a.color; x.lineWidth = 3;
  x.strokeRect(a.box[0], a.box[1], a.box[2] - a.box[0], a.box[3] - a.box[1]);
  return out.toDataURL('image/png');
}
