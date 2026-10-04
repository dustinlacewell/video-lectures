/* guard:bless: capture fresh samples and write them as the new golden. Refuses on a dirty tree
   outside golden/, unless --force. */

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { EXIT, exitUsage, parseCli } from '../shared/args.ts';
import { frameHash, framePng } from './capture.ts';
import { infoDigestInput } from './compare.ts';
import { dirtyOutsideGolden } from './dirty.ts';
import { sha256 } from './hash.ts';
import { writeOut } from '../shared/output.ts';
import type { Golden, GoldenSample } from './samples.ts';
import { sampleTimes } from './samples.ts';
import { withVideo, type Video } from '../shared/video.ts';

const USAGE = `guard:bless: capture fresh samples and write them as the blessed golden.
  --golden <dir>    golden folder to write (required)
  --repo <dir>      git repo root to check for a dirty tree (default: the golden folder's parent)
  --force           bless even if the tree is dirty outside golden/
  --refs <n>        how many reference PNGs to keep, evenly spread (default 12)
  --ref-width <px>  reference PNG width, for a small committed size (default 480)`;

const { common, own } = parseCli(USAGE, {
  golden: { type: 'string' }, repo: { type: 'string' }, force: { type: 'boolean' }, refs: { type: 'string' }, 'ref-width': { type: 'string' }
});
if (!own.golden) exitUsage(USAGE, EXIT.USAGE, '--golden <dir> is required');
const goldenDir = resolve(own.golden as string);
const repo = resolve((own.repo as string | undefined) ?? resolve(goldenDir, '..'));
const refCount = Number(own.refs ?? 12);
const refWidth = Number(own['ref-width'] ?? 480);

if (!own.force) {
  const dirty = dirtyOutsideGolden(repo, goldenDir);
  if (dirty.length) exitUsage(USAGE, EXIT.USAGE, 'working tree is dirty outside golden/: ' + dirty.join(', ') + '\nCommit or stash first, or pass --force.');
}

await withVideo(common, {}, async function (v) {
  const golden = await bless(v);
  writeOut(goldenDir, 'frames.json', JSON.stringify(golden, null, 2) + '\n');
  const refs = pick(golden.samples, refCount);
  for (const s of refs) writeOut(goldenDir, 'png/' + s.t.toFixed(3) + '.png', await pngBytes(v, s.t));
  console.log('blessed ' + golden.samples.length + ' samples, ' + refs.length + ' reference PNGs, at ' + goldenDir);
});

async function bless(v: Video): Promise<Golden> {
  const samples = sampleTimes(v.chapters, v.beats, v.total);
  const withFrames: GoldenSample[] = [];
  for (const s of samples) withFrames.push({ ...s, frame: await frameHash(v.session, s.t) });
  return {
    blessedAt: new Date().toISOString(),
    commit: commitHash(repo),
    libraryHash: libraryHash(repo),
    info: infoDigestInput(v.session.info),
    samples: withFrames
  };
}

/** Evenly spread picks across the sample list, including the first and last. */
function pick<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items;
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(items[Math.round((i * (items.length - 1)) / (n - 1))]);
  return Array.from(new Set(out));
}

async function pngBytes(v: Video, t: number): Promise<Buffer> {
  const url = await framePng(v.session, t, refWidth);
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
}

function commitHash(repo: string): string {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(); } catch { return '(unknown)'; }
}

/** Content hash of packages/library, shown for context; never enforced (guards.md). "(none)" before packages/library exists. */
function libraryHash(repo: string): string {
  try {
    const out = execFileSync('git', ['ls-tree', '-r', 'HEAD', '--', 'packages/library'], { cwd: repo, encoding: 'utf8' }).trim();
    return out ? sha256(out) : '(none)';
  } catch { return '(none)'; }
}
