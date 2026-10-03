/* Command-line options every tool shares, plus each tool's own. */

import { parseArgs, type ParseArgsConfig } from 'node:util';

export interface Common {
  /** A running player page. */
  url?: string;
  /** A built player folder to serve on a free port instead. */
  build?: string;
  out: string;
  /** A module exporting the script (chapters -> beats) as data, when the page has no __script(). */
  script?: string;
  /** durations.json on disk, instead of fetching it next to the page. */
  durations?: string;
  /** CSS selector of the video canvas. Default: the largest canvas on the page. */
  canvas?: string;
  /** Only these chapter ids. Empty = all. */
  chapters: string[];
}

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

/** Parse argv; print `usage` and exit on --help or a missing source/out. */
export function parseCli(usage: string, own: Options = {}): { common: Common; own: Record<string, unknown> } {
  const { values } = parseArgs({ args: process.argv.slice(2), options: { ...COMMON, ...own }, strict: true });
  const v = values as Record<string, unknown>;
  if (v.help || (!v.url && !v.build) || !v.out) { console.log(usage + '\n\n' + COMMON_USAGE); process.exit(v.help ? 0 : 2); }
  const common: Common = {
    url: v.url as string | undefined, build: v.build as string | undefined, out: v.out as string,
    script: v.script as string | undefined, durations: v.durations as string | undefined,
    canvas: v.canvas as string | undefined, chapters: (v.chapter as string[] | undefined) ?? []
  };
  return { common: common, own: v };
}

export const COMMON_USAGE = `Common options:
  --url <url>          a running player page, or
  --build <dir>        a built player folder; the tool serves it on a free port
  --out <dir>          where to write results (required)
  --script <file.ts>   module exporting the script data (SCRIPT or default), if the page has no __script()
  --durations <file>   durations.json on disk (default: fetched next to the page)
  --canvas <selector>  the video canvas (default: the largest canvas)
  --chapter <id>       only this chapter; repeatable`;

/** "0.1,0.5,0.9" -> [0.1, 0.5, 0.9]. */
export function numberList(s: string): number[] {
  return s.split(',').map(function (x) { return Number(x.trim()); }).filter(function (x) { return Number.isFinite(x); });
}
