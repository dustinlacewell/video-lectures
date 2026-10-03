/* Imperative shell: open the player and join its timeline with the script. Every tool starts here. */

import { EXIT, UsageError, type Common } from './args.ts';
import { chaptersOf, onlyChapters, timedBeats, type Beat, type Chapter } from './beats.ts';
import type { ScriptChapter } from './contract.ts';
import { openSession, type Session, type SessionOptions } from './session.ts';
import { loadScript } from './sources.ts';

/** `chapters` and `beats` honor --chapter; `allBeats` is the whole video. */
export interface Video { session: Session; script: ScriptChapter[]; chapters: Chapter[]; beats: Beat[]; allBeats: Beat[]; total: number }

export async function openVideo(common: Common, opts: SessionOptions = {}): Promise<Video> {
  const session = await openSession(common, opts);
  try {
    const script = await loadScript(session, common);
    const all = { chapters: chaptersOf(session.info, script), beats: timedBeats(session.info, script) };
    const picked = asUsage(function () { return onlyChapters(all.chapters, all.beats, common.chapters); });
    return { session: session, script: script, chapters: picked.chapters, beats: picked.beats, allBeats: all.beats, total: session.info.total };
  } catch (e) {
    await session.close();
    throw e;
  }
}

/** Run `f`; an error it throws is the caller's to fix with options. */
function asUsage<T>(f: () => T): T {
  try { return f(); } catch (e) { throw new UsageError(e instanceof Error ? e.message : String(e)); }
}

/** Run a tool body and always close the browser and server. Sets a failing exit code on error. */
export async function withVideo(common: Common, opts: SessionOptions, body: (v: Video) => Promise<void>): Promise<void> {
  let v: Video | undefined;
  try {
    v = await openVideo(common, opts);
    await body(v);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = e instanceof UsageError ? EXIT.USAGE : EXIT.RUN_FAILED;
  } finally {
    if (v) await v.session.close();
  }
}
