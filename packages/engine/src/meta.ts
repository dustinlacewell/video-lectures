/* Pure: a video's build-time metadata (runtime, chapters) from its script and measured durations.
   No I/O, no Vite — the vite.ts plugin reads the script and writes the result. */

import { buildTimeline, voiceDurations, type Durations } from './timeline.ts';
import type { Cast, ChapterScript } from './script.ts';

export interface MetaChapter {
  /** `title` when the chapter has one, else `short`. */
  title: string;
  /** Seconds from video start. */
  start: number;
}

export interface Meta {
  slug: string;
  /** Total seconds, exact (not rounded). */
  runtime: number;
  chapters: MetaChapter[];
}

/**
 * The same pure timeline the player builds, reduced to what the site needs at build time.
 * `clips`: clip lengths from voice/clips/durations.json (beat-less; seconds per clip id), the same
 * input the player fetches at runtime. Turned into per-beat durations the same way the player does.
 */
export function buildMeta(slug: string, script: ChapterScript[], clips: Durations = {}, cast: Cast = {}): Meta {
  const tl = buildTimeline(script, voiceDurations(script, clips, cast), cast);
  return {
    slug: slug,
    runtime: tl.total,
    chapters: tl.chapters.map(function (ch) { return { title: ch.title ?? ch.short, start: ch.start }; })
  };
}
