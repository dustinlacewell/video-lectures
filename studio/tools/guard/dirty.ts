/* Ask git which tracked paths are dirty, outside the golden folder. */

import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';

/** Pure: `git status --porcelain` output -> dirty paths, excluding anything under `goldenRel` (relative, forward slashes). */
export function parsePorcelain(porcelain: string, goldenRel: string): string[] {
  return porcelain.split('\n').filter(function (l) { return l.trim() !== ''; })
    .map(function (l) { return l.slice(3).replace(/\\/g, '/').replace(/^"|"$/g, ''); })
    .filter(function (p) { return !(p === goldenRel || p.startsWith(goldenRel + '/')); });
}

/** Paths with uncommitted changes (staged or not), relative to `cwd`, excluding anything under `goldenDir`. */
export function dirtyOutsideGolden(cwd: string, goldenDir: string): string[] {
  const out = execFileSync('git', ['status', '--porcelain'], { cwd: cwd, encoding: 'utf8' });
  const rel = relative(cwd, goldenDir).replace(/\\/g, '/');
  return parsePorcelain(out, rel);
}
