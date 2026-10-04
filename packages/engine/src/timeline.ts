/* Pure: script chapters (+ optional measured durations) -> timed beats, cues, total. */

import type { SfxName } from './audio/sfx';
import { captionOf, speakersOf, voiceLines, type VoiceLine } from './audio/voiceLines';
import { resolveCams } from './camera';
import type { BeatScript, Cam, CamFn, Cast, ChapterScript, SfxCue } from './script';

/** A voice clip in a timed beat, with its speaker's pad (seconds of quiet after the line). */
export interface TimedLine extends VoiceLine { pad: number }

export interface TimedBeat extends BeatScript {
  /** Id local to the chapter, used by scenes ("fall" for "physics.fall"). */
  key: string;
  i: number;
  /** Seconds from chapter start. */
  start: number;
  dur: number;
  chTitle?: boolean;
  /** Who says `say`, always a list. Scenes draw non-narrator lines in speech bubbles. */
  speakers: string[];
  /** The caption: `say` when the narrator speaks it, else nothing. */
  caption?: string;
  /** Voice clips of this beat, `at` seconds after the beat starts. */
  lines: TimedLine[];
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

/** `cast` gives each line its speaker's pad; without it every pad is DEFAULT_PAD. */
export function buildTimeline(chapters: ChapterScript[], durations: Durations = {}, cast: Partial<Cast> = {}): Timeline {
  const out: TimedChapter[] = [], cues: Cue[] = [];
  let T = 0;
  chapters.forEach(function (script, ci) {
    const ch = timeChapter(script, ci, T, durations, cast, cues);
    out.push(ch);
    T += ch.dur;
  });
  cues.sort(function (p, q) { return p.t - q.t; });
  return { chapters: out, cues: cues, total: T };
}

function timeChapter(script: ChapterScript, ci: number, T: number, durations: Durations, cast: Partial<Cast>, cues: Cue[]): TimedChapter {
  const src = withTitleBeat(script), idx: Record<string, number> = {}, beats: TimedBeat[] = [];
  let a = 0;
  src.forEach(function (b, i) {
    const key = keyOf(script.id, b.id);
    const dur = beatDuration(b, durations);
    const sfx = b.sfx || (b.card ? CARD_SFX : undefined);
    const tb: TimedBeat = { ...b, key: key, i: i, start: a, dur: dur, speakers: speakersOf(b), caption: captionOf(b), lines: timedLines(b, cast) };
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

/** Seconds of quiet after a line when the speaker sets no pad. */
export const DEFAULT_PAD = 0.6;

function padOf(cast: Partial<Cast>, speaker: string): number {
  return cast[speaker]?.pad ?? DEFAULT_PAD;
}

function timedLines(b: BeatScript, cast: Partial<Cast>): TimedLine[] {
  return voiceLines(b).map(function (l) { return { ...l, pad: padOf(cast, l.speaker) }; });
}

/**
 * Beat durations from voice clip lengths (clip id -> seconds).
 * A voiced beat lasts until its last clip ends (start offset + length), plus the largest pad of its speakers.
 * An explicit `dur` wins only when it is longer: a visual beat may need more time than its line.
 * A card keeps at least its reading time, so a quick read-out does not take the card away early.
 * A beat with any clip missing gets no entry, so it falls back to `dur` or the word-count estimate.
 */
export function voiceDurations(chapters: ChapterScript[], clips: Durations, cast: Cast): Durations {
  const out: Durations = {};
  chapters.forEach(function (ch) {
    ch.beats.forEach(function (b) {
      const voiced = voicedDuration(b, clips, cast);
      if (voiced !== undefined) out[b.id] = Math.max(voiced, minDuration(b));
    });
  });
  return out;
}

/** The least a voiced beat may last: its explicit `dur`, else a card's reading time, else nothing. */
function minDuration(b: BeatScript): number {
  if (b.dur) return b.dur;
  return b.card ? beatDuration(b, {}) : 0;
}

function voicedDuration(b: BeatScript, clips: Durations, cast: Cast): number | undefined {
  const lines = voiceLines(b);
  if (!lines.length || lines.some(function (l) { return !clips[l.clip]; })) return undefined;
  const end = Math.max(...lines.map(function (l) { return l.at + clips[l.clip]; }));
  const pad = Math.max(...lines.map(function (l) { return padOf(cast, l.speaker); }));
  return end + pad;
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

/** Index of the first cue at or after T in time-sorted cues. A cue exactly at T is still to play. */
export function firstCueAt(cues: Cue[], T: number): number {
  let i = 0;
  while (i < cues.length && cues[i].t < T) i++;
  return i;
}

/** The chapter that contains time T (seconds from video start). */
export function chapterAt(tl: Timeline, T: number): TimedChapter {
  let r = tl.chapters[0];
  for (let i = 0; i < tl.chapters.length; i++) if (T >= tl.chapters[i].start) r = tl.chapters[i];
  return r;
}
