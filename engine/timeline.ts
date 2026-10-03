/* Pure: script chapters (+ optional measured durations) -> timed beats, cues, total. */

import type { BeatScript, Cam, CamFn, ChapterScript, SfxCue, SfxName } from '../script/types';
import { resolveCams } from './camera';

export interface TimedBeat extends BeatScript {
  /** Id local to the chapter, used by scenes ("fall" for "physics.fall"). */
  key: string;
  i: number;
  /** Seconds from chapter start. */
  start: number;
  dur: number;
  chTitle?: boolean;
}

export interface TimedChapter {
  id: string;
  ci: number;
  title?: string;
  short: string;
  root: number;
  scale: number[];
  /** Seconds from video start. */
  start: number;
  dur: number;
  beats: TimedBeat[];
  /** Beat key -> beat index. */
  idx: Record<string, number>;
  /** Per beat: the camera in force (pre-resolved). */
  cams: (Cam | CamFn | undefined)[];
}

export interface Cue { t: number; type: SfxName; arg?: number }

export interface Timeline { chapters: TimedChapter[]; cues: Cue[]; total: number }

/** Measured seconds per beat id, e.g. from narration audio. */
export type Durations = Record<string, number>;

export const TITLE_KEY = '_title';
const TITLE_DUR = 3.4;
const TITLE_SFX: SfxCue[] = [[0.05, 'whoosh'], [0.5, 'ding']];
const CARD_SFX: SfxCue[] = [[0.1, 'card']];

export function buildTimeline(chapters: ChapterScript[], durations: Durations = {}): Timeline {
  const out: TimedChapter[] = [], cues: Cue[] = [];
  let T = 0;
  chapters.forEach(function (script, ci) {
    const ch = timeChapter(script, ci, T, durations, cues);
    out.push(ch);
    T += ch.dur;
  });
  cues.sort(function (p, q) { return p.t - q.t; });
  return { chapters: out, cues: cues, total: T };
}

function timeChapter(script: ChapterScript, ci: number, T: number, durations: Durations, cues: Cue[]): TimedChapter {
  const src = withTitleBeat(script), idx: Record<string, number> = {}, beats: TimedBeat[] = [];
  let a = 0;
  src.forEach(function (b, i) {
    const key = keyOf(script.id, b.id);
    const dur = beatDuration(b, durations);
    const sfx = b.sfx || (b.card ? CARD_SFX : undefined);
    const tb: TimedBeat = { ...b, key: key, i: i, start: a, dur: dur };
    if (sfx) tb.sfx = sfx;
    beats.push(tb);
    idx[key] = i;
    (sfx || []).forEach(function (q) { cues.push({ t: T + a + q[0], type: q[1], arg: q[2] }); });
    a += dur;
  });
  (script.cues || []).forEach(function (q) {
    const b = beats[idx[keyOf(script.id, q[0])]];
    cues.push({ t: T + b.start + q[1], type: q[2], arg: q[3] });
  });
  return {
    id: script.id, ci: ci, title: script.title, short: script.short, root: script.root, scale: script.scale,
    start: T, dur: a, beats: beats, idx: idx, cams: resolveCams(beats)
  };
}

/** A titled chapter opens with a title-card beat that holds the first beat's camera. */
function withTitleBeat(script: ChapterScript): (BeatScript & { chTitle?: boolean })[] {
  if (!script.title) return script.beats;
  const first = script.beats[0];
  const title = { id: script.id + '.' + TITLE_KEY, chTitle: true, dur: TITLE_DUR, cam: first.cam, sfx: TITLE_SFX };
  return [title, ...script.beats];
}

/** Measured duration, else the script's fixed duration, else the word-count estimate. */
export function beatDuration(b: BeatScript, durations: Durations): number {
  const measured = durations[b.id];
  if (measured) return measured;
  if (b.dur) return b.dur;
  const words = (b.say || b.card || '').split(/\s+/).length;
  return b.card ? 3.0 + words * 0.42 : Math.max(4.6, 2.2 + words * 0.42);
}

export function keyOf(chapterId: string, beatId: string): string {
  const prefix = chapterId + '.';
  if (beatId.indexOf(prefix) !== 0) throw new Error('beat id "' + beatId + '" must start with "' + prefix + '"');
  return beatId.slice(prefix.length);
}

/** The chapter that contains time T (seconds from video start). */
export function chapterAt(tl: Timeline, T: number): TimedChapter {
  let r = tl.chapters[0];
  for (let i = 0; i < tl.chapters.length; i++) if (T >= tl.chapters[i].start) r = tl.chapters[i];
  return r;
}
