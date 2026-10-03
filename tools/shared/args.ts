/* Command-line options every tool shares, plus each tool's own. */

import { isAbsolute, resolve } from 'node:path';
import { parseArgs, type ParseArgsConfig } from 'node:util';

export interface Common {
  /** A running player page. */
  url?: string;
  /** A built player folder to serve on a free port instead. Absolute. */
  build?: string;
  /** Absolute. */
  out: string;
  /** A module exporting the script (chapters -> beats) as data, when the page has no __script(). Absolute. */
  script?: string;
  /** durations.json on disk, instead of fetching it next to the page. Absolute. */
  durations?: string;
  /** CSS selector of the video canvas. Default: the largest canvas on the page. */
  canvas?: string;
  /** Only these chapter ids. Empty = all. */
  chapters: string[];
}

/** Exit codes shared by every tool. A tool may add CHECK_FAILED for its own check. */
export const EXIT = { OK: 0, RUN_FAILED: 1, USAGE: 2, CHECK_FAILED: 3 } as const;

/** A problem the caller fixes with options (exit 2), found after the page opened. */
export class UsageError extends Error {}

type Options = NonNullable<ParseArgsConfig['options']>;

const COMMON: Options = {
  url: { type: 'string' },
  build: { type: 'string' },
  out: { type: 'string' },
  script: { type: 'string' },
  durations: { type: 'string' },
  canvas: { type: 'string' },
  chapter: { type: 'string', multiple: true },
  help: { type: 'boolean' }
};

/** Parse argv; print `usage` and exit on --help, an unknown option, or a missing source/out. */
export function parseCli(usage: string, own: Options = {}): { common: Common; own: Record<string, unknown> } {
  const v = parseOrExit(usage, { ...COMMON, ...own });
  if (v.help || (!v.url && !v.build) || !v.out) exitUsage(usage, v.help ? EXIT.OK : EXIT.USAGE);
  const common: Common = {
    url: v.url as string | undefined, build: callerPath(v.build as string | undefined), out: callerPath(v.out as string)!,
    script: callerPath(v.script as string | undefined), durations: callerPath(v.durations as string | undefined),
    canvas: v.canvas as string | undefined, chapters: (v.chapter as string[] | undefined) ?? []
  };
  return { common: common, own: v };
}

/** A path as the caller typed it, made absolute against the caller's folder.
    `pnpm --dir <tools> <tool>` runs in the tools folder; pnpm keeps the caller's folder in INIT_CWD. */
export function callerPath(p: string | undefined): string | undefined {
  if (p === undefined) return undefined;
  return isAbsolute(p) ? p : resolve(process.env.INIT_CWD ?? process.cwd(), p);
}

/** Print the problem and the usage, then exit with the usage code. */
export function exitUsage(usage: string, code: number = EXIT.USAGE, problem?: string): never {
  if (problem) console.error(problem + '\n');
  console.log(usage + '\n\n' + COMMON_USAGE);
  process.exit(code);
}

function parseOrExit(usage: string, options: Options): Record<string, unknown> {
  try {
    return parseArgs({ args: process.argv.slice(2), options: options, strict: true }).values as Record<string, unknown>;
  } catch (e) {
    return exitUsage(usage, EXIT.USAGE, e instanceof Error ? e.message : String(e));
  }
}

export const COMMON_USAGE = `Common options:
  --url <url>          a running player page, or
  --build <dir>        a built player folder; the tool serves it on a free port
  --out <dir>          where to write results (required)
  --script <file.ts>   module exporting the script data (SCRIPT or default), if the page has no __script()
  --durations <file>   durations.json on disk (default: fetched next to the page)
  --canvas <selector>  the video canvas (default: the largest canvas)
  --chapter <id>       only this chapter; repeatable
Relative paths count from the folder you ran pnpm in.
Exit codes: 0 done, 1 the run failed, 2 bad options, 3 the tool's check failed (contact-sheet --twice).`;

/** "0.1,0.5,0.9" -> [0.1, 0.5, 0.9]. Spaces also separate: PowerShell passes an unquoted 0.1,0.5 as "0.1 0.5". */
export function numberList(s: string): number[] {
  return s.split(/[\s,]+/).filter(function (x) { return x !== ''; }).map(Number).filter(function (x) { return Number.isFinite(x); });
}
