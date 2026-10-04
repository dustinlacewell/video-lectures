/* Shapes of the script: what is said, shown, and heard, and when. No drawing. */

import type { SfxName } from './audio/sfx';
import type { BeatState } from './beatState';

/** A sound at `at` seconds into a beat. `arg` shifts pitch for some sounds. */
export type SfxCue = [at: number, sfx: SfxName, arg?: number];

/* `S` is the video's speaker ids. A video narrows it in its own script/types.ts; the engine reads any string. */

export interface CastMember {
  /** Label in the script text and speech bubbles. */
  name: string;
  /** Reference clip the voice is cloned from, relative to voice/. Every line clones this one clip. */
  ref: string;
  /** Exact transcript of `ref`. Default: the text file beside it (refs/narrator.wav -> refs/narrator.txt). */
  refText?: string;
  /** Optional delivery direction (tone, pace, emotion). It steers the cloned voice; it does not change who speaks. */
  style?: string;
  /** Seconds of quiet after this speaker's line before the next beat. Default in engine/timeline.ts. */
  pad?: number;
}

export type Cast<S extends string = string> = Record<S, CastMember>;

export interface Cam { x: number; y: number; z: number }

/** A camera that moves with time inside its beat. */
export type CamFn = (S: BeatState) => Cam;

export interface BeatScript<S extends string = string> {
  /** Stable global id, "<chapter>.<key>". Audio files are named by it. */
  id: string;
  /** The spoken line. A narrator line is also the caption. */
  say?: string;
  /** Who says `say`. Default "narrator". Several speakers each get their own clip and speak together. */
  speaker?: S | S[];
  /** With several speakers: seconds between each one's start. Default 0.15. */
  stagger?: number;
  /** Full-screen card text. */
  card?: string;
  /** Fixed duration in seconds. Without it, duration comes from word count. */
  dur?: number;
  /** Camera from this beat on, until another beat sets one. */
  cam?: Cam | CamFn;
  /** Seconds to ease from the previous camera. Default 1.8. */
  camT?: number;
  /** No slow zoom drift during this beat. */
  still?: boolean;
  sfx?: SfxCue[];
}

/** A sound tied to a beat but authored at chapter level: [beatId, at, sfx, arg]. */
export type ChapterCue = [beatId: string, at: number, sfx: SfxName, arg?: number];

export interface ChapterScript<S extends string = string> {
  /** Stable id; prefix of every beat id in the chapter. */
  id: string;
  /** Shown on the chapter title card. A chapter with no title gets no title card. */
  title?: string;
  /** Label on the chapter chip. */
  short: string;
  /** Music root frequency (Hz) and scale (semitones). */
  root: number;
  scale: number[];
  beats: BeatScript<S>[];
  cues?: ChapterCue[];
}
