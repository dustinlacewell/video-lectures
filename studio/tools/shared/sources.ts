/* Imperative shell: load the script data and the clip lengths a tool needs. */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { UsageError, type Common } from './args.ts';
import type { ClipLengths, ScriptBeat, ScriptChapter } from './contract.ts';
import type { Session } from './session.ts';

const NO_SCRIPT = 'The tool needs the script as data, and has neither source.\n' +
  '  1. The page has no window.__script(). Add `window.__script = () => SCRIPT` to the player\'s debug globals (engine/contract.md section 8), or\n' +
  '  2. pass --script <project>/script/index.ts (a module exporting the chapter array as SCRIPT or default).';

/** The script as data: window.__script() when the page has it, else the --script module. */
export async function loadScript(s: Session, common: Common): Promise<ScriptChapter[]> {
  const fromPage = await s.page.evaluate(function () {
    const f = (window as any).__script;
    return typeof f === 'function' ? JSON.parse(JSON.stringify(f())) : null;
  }) as unknown[] | null;
  if (fromPage) return toChapters(fromPage);
  if (!common.script) throw new UsageError(NO_SCRIPT);
  const mod = await import(pathToFileURL(common.script).href) as Record<string, unknown>;
  const data = mod.SCRIPT ?? mod.default ?? Object.values(mod).find(Array.isArray);
  if (!Array.isArray(data)) throw new Error(common.script + ' exports no script array (SCRIPT or default)');
  return toChapters(data);
}

/** Clip lengths: --durations file, else durations.json next to the page, else none. */
export async function loadClipLengths(s: Session, common: Common): Promise<ClipLengths> {
  if (common.durations) return JSON.parse(readFileSync(common.durations, 'utf8')) as ClipLengths;
  return await s.page.evaluate(async function () {
    try {
      const r = await fetch(new URL('durations.json', location.href).href);
      return r.ok ? await r.json() : {};
    } catch { return {}; }
  }) as ClipLengths;
}

function toChapters(data: unknown[]): ScriptChapter[] {
  return data.map(function (raw) {
    const c = raw as Record<string, unknown>;
    return { id: String(c.id), title: c.title as string | undefined, short: c.short as string | undefined, beats: ((c.beats as unknown[]) ?? []).map(toBeat) };
  });
}

function toBeat(raw: unknown): ScriptBeat {
  const b = raw as Record<string, unknown>;
  return {
    id: String(b.id), say: b.say as string | undefined, card: b.card as string | undefined,
    speaker: b.speaker as string | string[] | undefined, stagger: b.stagger as number | undefined, dur: b.dur as number | undefined
  };
}
