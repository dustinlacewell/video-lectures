/* Parity check: render the same timestamps in the original single-file HTML and in the built port,
   then diff canvas pixels, timelines, cameras and script text.
   Run after `vite build`:  node tools/parity.ts [--write-fixture]
   Env: ORIGINAL_HTML (path to the original), PARITY_DPR (default 2). */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Page } from 'playwright';
import { PNG } from 'pngjs';
import { preview } from 'vite';

const ORIGINAL = process.env.ORIGINAL_HTML || 'P:/downloads/What a Mind Is Made Of.html';
const DPR = Number(process.env.PARITY_DPR || 2);
const OUT = resolve('out/parity');
const FIXTURE = resolve('test/fixtures/original-timeline.json');
const PORT = 4317;

interface Info { total: number; chapters: { start: number; dur: number; beats: (string | number)[][] }[]; cues?: { t: number; type: string; arg?: number }[] }
interface FrameResult { t: number; mismatched: number; pct: number; maxDelta: number }

main().catch(function (e) { console.error(e); process.exit(1); });

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await preview({ configFile: resolve('vite.config.ts'), preview: { port: PORT, strictPort: true, open: false } });
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: DPR });
    const origPage = await ctx.newPage();
    await origPage.addInitScript(captureCues);
    const orig = await openReady(Promise.resolve(origPage), pathToFileURL(ORIGINAL).href);
    const port = await openReady(ctx.newPage(), 'http://localhost:' + PORT + '/');
    const failures: string[] = [];
    const oInfo = await info(orig), pInfo = await info(port);
    if (process.argv.includes('--write-fixture')) {
      const cues = await orig.evaluate(function () { return (window as any).__origCues; });
      writeFileSync(FIXTURE, JSON.stringify({ total: oInfo.total, chapters: oInfo.chapters, cues: cues }) + '\n');
    }
    compareTimelines(oInfo, pInfo, failures);
    await compareCues(orig, pInfo, failures);
    await compareText(orig, port, failures);
    const times = sampleTimes(oInfo);
    await compareCameras(orig, port, times, failures);
    const frames = await compareFrames(orig, port, times);
    await controlCheck(orig, port, times[Math.floor(times.length / 2)], failures);
    report(oInfo, pInfo, frames, failures);
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
    await new Promise<void>(function (r) { server.httpServer.close(function () { r(); }); });
  }
}

/** Load a page and wait until web fonts are in and the post-font re-render has happened. */
async function openReady(pageP: Promise<Page>, url: string): Promise<Page> {
  const page = await pageP;
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(async function () {
    await Promise.all([document.fonts.load('600 40px Fredoka'), document.fonts.load('700 40px Fredoka'), document.fonts.load('500 40px Fredoka')]);
    await document.fonts.ready;
    await new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); });
  });
  const ok = await page.evaluate(function () { return document.fonts.check('700 40px Fredoka'); });
  if (!ok) throw new Error('Fredoka did not load in ' + url);
  return page;
}

function info(page: Page): Promise<Info> { return page.evaluate(function () { return (window as any).__info(); }); }

function compareTimelines(o: Info, p: Info, failures: string[]): void {
  if (o.total !== p.total) failures.push('total differs: ' + o.total + ' vs ' + p.total);
  if (o.chapters.length !== p.chapters.length) { failures.push('chapter count differs'); return; }
  o.chapters.forEach(function (oc, i) {
    const pc = p.chapters[i];
    if (oc.start !== pc.start || oc.dur !== pc.dur) failures.push('chapter ' + i + ' start/dur differs');
    if (oc.beats.length !== pc.beats.length) { failures.push('chapter ' + i + ' beat count differs'); return; }
    oc.beats.forEach(function (ob, j) {
      const pb = pc.beats[j];
      if (ob[0] !== pb[0] || ob[1] !== pb[1] || ob[2] !== pb[2]) failures.push('beat ' + i + '/' + j + ' differs: ' + JSON.stringify(ob) + ' vs ' + JSON.stringify(pb.slice(0, 3)));
    });
  });
}

/** The original keeps its cue list private. It sorts it once at boot; record the array it sorts. */
function captureCues(): void {
  const sort = Array.prototype.sort;
  Array.prototype.sort = function (this: any[], cmp?: (a: any, b: any) => number) {
    const r = sort.call(this, cmp);
    if (this.length && this[0] && typeof this[0].t === 'number' && 'type' in this[0]) (window as any).__origCues = this.map(function (q: any) { return { t: q.t, type: q.type, arg: q.arg }; });
    return r;
  } as typeof Array.prototype.sort;
}

async function compareCues(o: Page, p: Info, failures: string[]): Promise<void> {
  const oc: { t: number; type: string; arg?: number }[] = await o.evaluate(function () { return (window as any).__origCues; });
  const pc = p.cues || [];
  if (!oc) { failures.push('could not capture original cues'); return; }
  const norm = function (q: { t: number; type: string; arg?: number }) { return q.t + '|' + q.type + '|' + (q.arg == null ? '' : q.arg); };
  const a = oc.map(norm).join('\n'), b = pc.map(norm).join('\n');
  console.log('sound cues: original ' + oc.length + ', port ' + pc.length + (a === b ? ' (identical)' : ' (DIFFER)'));
  if (a !== b) failures.push('sound cues differ');
}

async function compareText(o: Page, p: Page, failures: string[]): Promise<void> {
  function grab(page: Page) {
    return page.evaluate(function () {
      return { script: document.getElementById('script')!.innerHTML, chips: document.getElementById('chips')!.innerHTML, seekMax: (document.getElementById('seek') as HTMLInputElement).max };
    });
  }
  const a = await grab(o), b = await grab(p);
  if (a.script !== b.script) failures.push('script text differs');
  if (a.chips !== b.chips) failures.push('chapter chips differ');
  if (a.seekMax !== b.seekMax) failures.push('seek max differs');
}

/** ~40 evenly spaced times plus moments around every chapter fade and some camera moves. */
function sampleTimes(o: Info): number[] {
  const ts: number[] = [];
  for (let i = 0; i < 40; i++) ts.push(0.37 + i * (o.total - 1) / 40);
  o.chapters.forEach(function (ch, i) {
    if (i) { ts.push(ch.start - 0.2); ts.push(ch.start + 0.2); }
  });
  o.chapters.forEach(function (ch) {
    const b = ch.beats[Math.min(3, ch.beats.length - 1)];
    ts.push(ch.start + (b[1] as number) + 0.9);
  });
  ts.push(o.total - 0.001);
  return ts.filter(function (t) { return t >= 0 && t < o.total; }).sort(function (a, b) { return a - b; });
}

async function compareCameras(o: Page, p: Page, times: number[], failures: string[]): Promise<void> {
  for (const t of times) {
    const a = await o.evaluate(function (v) { return (window as any).__cam(v); }, t);
    const b = await p.evaluate(function (v) { return (window as any).__cam(v); }, t);
    if (JSON.stringify(a) !== JSON.stringify(b)) failures.push('camera differs at ' + t.toFixed(3) + ': ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b));
  }
}

function frame(page: Page, t: number): Promise<PNG> {
  return page.evaluate(function (v) {
    (window as any).__seek(v);
    return (document.getElementById('cv') as HTMLCanvasElement).toDataURL('image/png');
  }, t).then(function (url) { return PNG.sync.read(Buffer.from(url.slice(url.indexOf(',') + 1), 'base64')); });
}

async function compareFrames(o: Page, p: Page, times: number[]): Promise<FrameResult[]> {
  const out: FrameResult[] = [];
  for (const t of times) {
    const a = await frame(o, t), b = await frame(p, t);
    if (a.width !== b.width || a.height !== b.height) throw new Error('canvas size differs: ' + a.width + 'x' + a.height + ' vs ' + b.width + 'x' + b.height);
    const r = diff(a, b, t);
    out.push(r);
  }
  return out;
}

/** Prove the detector works: two different moments must not compare equal. */
async function controlCheck(o: Page, p: Page, t: number, failures: string[]): Promise<void> {
  const a = await frame(o, t), b = await frame(p, t + 0.5);
  let n = 0;
  for (let i = 0; i < a.data.length; i += 4) if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) n++;
  console.log('canvas ' + a.width + 'x' + a.height + '; control (t vs t+0.5) mismatched px: ' + n);
  if (n === 0) failures.push('control check found no difference between different moments');
}

/** Count pixels that differ at all; write a diff image when any do. */
function diff(a: PNG, b: PNG, t: number): FrameResult {
  const d = new PNG({ width: a.width, height: a.height });
  let mismatched = 0, maxDelta = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const dd = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]), Math.abs(a.data[i + 3] - b.data[i + 3]));
    if (dd > 0) { mismatched++; maxDelta = Math.max(maxDelta, dd); d.data[i] = 255; d.data[i + 1] = 0; d.data[i + 2] = 0; }
    else { d.data[i] = a.data[i] >> 2; d.data[i + 1] = a.data[i + 1] >> 2; d.data[i + 2] = a.data[i + 2] >> 2; }
    d.data[i + 3] = 255;
  }
  if (mismatched) writeFileSync(resolve(OUT, 'diff-' + t.toFixed(3) + '.png'), PNG.sync.write(d));
  return { t: t, mismatched: mismatched, pct: 100 * mismatched / (a.width * a.height), maxDelta: maxDelta };
}

function report(o: Info, p: Info, frames: FrameResult[], failures: string[]): void {
  const worst = frames.reduce(function (m, f) { return f.pct > m.pct ? f : m; }, frames[0]);
  const bad = frames.filter(function (f) { return f.mismatched > 0; });
  console.log('total runtime: original ' + o.total + ' s, port ' + p.total + ' s');
  console.log('frames compared: ' + frames.length + ', frames with any mismatch: ' + bad.length);
  console.log('worst frame: t=' + worst.t.toFixed(3) + ' mismatched=' + worst.mismatched + ' (' + worst.pct.toFixed(4) + '%) maxDelta=' + worst.maxDelta);
  bad.forEach(function (f) { console.log('  t=' + f.t.toFixed(3) + ' px=' + f.mismatched + ' (' + f.pct.toFixed(4) + '%) maxDelta=' + f.maxDelta); });
  failures.forEach(function (f) { console.log('FAIL ' + f); });
  console.log(failures.length ? 'PARITY: structural differences found' : 'PARITY: timelines, cameras and text identical');
}
