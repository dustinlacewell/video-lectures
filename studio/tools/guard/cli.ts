/* guard: prove a finished video's pixels, timing and beat starts have not moved from the blessed golden. */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { EXIT, parseCli } from '../shared/args.ts';
import { frameHash } from './capture.ts';
import { diffSamples, infoChanged, type Captured } from './compare.ts';
import type { Golden } from './samples.ts';
import { sampleTimes } from './samples.ts';
import { mismatchLines, summaryLine, type RunReport } from './report.ts';
import { withVideo, type Video } from '../shared/video.ts';

const USAGE = `guard: compare a built video against its blessed golden frames.
  --golden <dir>   golden folder (default: <out>/../golden, or ./golden next to --out)
  --control        negative control: compare the frame at a sample's time against t+0.5; must differ. No golden needed.`;

const { common, own } = parseCli(USAGE, { golden: { type: 'string' }, control: { type: 'boolean' } });
const goldenDir = (own.golden as string | undefined) ? resolve(own.golden as string) : resolve(common.out, '..', 'golden');
const slug = own.control ? '(control)' : goldenDir.split(/[\\/]/).filter(Boolean).slice(-2, -1)[0] ?? goldenDir;

await withVideo(common, {}, async function (v) {
  const started = Date.now();
  if (own.control) { await runControl(v); return; }
  await runGuard(v, goldenDir, started);
});

async function runGuard(v: Video, goldenDir: string, started: number): Promise<void> {
  const path = resolve(goldenDir, 'frames.json');
  if (!existsSync(path)) throw new Error('no golden at ' + path + '; run `wm guard:bless` first');
  const golden = JSON.parse(readFileSync(path, 'utf8')) as Golden;
  const info = infoChanged(golden.info, v.session.info);
  const times = golden.samples.map(function (s) { return s.t; });
  const captured: Captured[] = [];
  for (const t of times) captured.push({ t: t, why: '', frame: await frameHash(v.session, t) });
  const mismatches = diffSamples(golden.samples, captured);
  const report: RunReport = {
    slug: slug, sampleCount: golden.samples.length, mismatches: mismatches, infoChanged: info.changed,
    control: { ran: false, distinct: true }, seconds: (Date.now() - started) / 1000
  };
  console.log(summaryLine(report));
  mismatchLines(mismatches).forEach(function (l) { console.log(l); });
  if (info.changed) console.log('  __info() differs from the blessed golden (runtime or a beat start moved)');
  if (mismatches.length || info.changed) process.exitCode = EXIT.CHECK_FAILED;
}

/** Prove the detector can fail: a sample's frame must differ from the frame half the video away. */
async function runControl(v: Video): Promise<void> {
  const started = Date.now();
  const samples = sampleTimes(v.chapters, v.beats, v.total);
  const mid = samples[Math.floor(samples.length / 2)].t;
  const away = (mid + v.total / 2) % v.total;
  const a = await frameHash(v.session, mid), b = await frameHash(v.session, away);
  const distinct = a !== b;
  const report: RunReport = {
    slug: slug, sampleCount: 1, mismatches: [], infoChanged: false,
    control: { ran: true, distinct: distinct }, seconds: (Date.now() - started) / 1000
  };
  console.log(summaryLine(report) + ' (t=' + mid.toFixed(3) + ' vs t=' + away.toFixed(3) + ')');
  if (!distinct) process.exitCode = EXIT.CHECK_FAILED;
}
