/* Shapes of the script: what is said, shown, and heard, and when. No drawing. */

import type { BeatState } from '../engine/beatState';

export type SfxName =
  | 'pop' | 'unpop' | 'tick' | 'thud' | 'whoosh' | 'swish' | 'fail' | 'ding' | 'card' | 'zap' | 'blip'
  | 'yelp' | 'stamp' | 'rise' | 'fall' | 'click' | 'snip' | 'spark' | 'scan' | 'boo' | 'talk';

/** A sound at `at` seconds into a beat. `arg` shifts pitch for some sounds. */
export type SfxCue = [at: number, sfx: SfxName, arg?: number];

export interface Cam { x: number; y: number; z: number }

/** A camera that moves with time inside its beat. */
export type CamFn = (S: BeatState) => Cam;

export interface BeatScript {
  /** Stable global id, "<chapter>.<key>". Audio files are named by it. */
  id: string;
  /** Narration, shown as the caption. */
  say?: string;
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

export interface ChapterScript {
  /** Stable id; prefix of every beat id in the chapter. */
  id: string;
  /** Shown on the chapter title card. A chapter with no title gets no title card. */
  title?: string;
  /** Label on the chapter chip. */
  short: string;
  /** Music root frequency (Hz) and scale (semitones). */
  root: number;
  scale: number[];
  beats: BeatScript[];
  cues?: ChapterCue[];
}
