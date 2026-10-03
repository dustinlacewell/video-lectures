/* Build the whole site into dist/: each video's player at dist/<slug>/, then the series index at dist/. */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseVideo, type Video } from './src/catalog.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const VIDEOS = join(ROOT, 'videos');

rmSync(DIST, { recursive: true, force: true });
for (const v of readVideos()) buildVideo(v);
buildIndex();
console.log(`site built into ${DIST}`);

function readVideos(): Video[] {
  return readdirSync(VIDEOS)
    .filter(dir => existsSync(join(VIDEOS, dir, 'video.json')))
    .map(dir => {
      const file = join(VIDEOS, dir, 'video.json');
      const v = parseVideo(JSON.parse(readFileSync(file, 'utf8')), file);
      if (v.slug !== dir) throw new Error(`${file}: slug "${v.slug}" must match its folder name "${dir}"`);
      return v;
    });
}

/** Type-check, then build the player with its base path set to /<slug>/. */
function buildVideo(v: Video): void {
  const cwd = join(VIDEOS, v.slug);
  run('pnpm exec tsc --noEmit', cwd);
  run(`pnpm exec vite build --base /${v.slug}/ --outDir "${join(DIST, v.slug)}" --emptyOutDir`, cwd);
}

/** The index builds last and keeps dist/ (emptyOutDir is off in site/vite.config.ts). */
function buildIndex(): void {
  const cwd = join(ROOT, 'site');
  run('pnpm exec tsc --noEmit', cwd);
  run('pnpm exec vite build', cwd);
}

function run(cmd: string, cwd: string): void {
  console.log(`\n> ${cmd}  (${cwd})`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}
