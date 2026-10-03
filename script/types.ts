/* Shapes of the script: what is said, shown, and heard, and when. No drawing. */

import type { BeatState } from '../engine/beatState';

export type SfxName =
  | 'pop' | 'unpop' | 'tick' | 'thud' | 'whoosh' | 'swish' | 'fail' | 'ding' | 'card' | 'zap' | 'blip'
  | 'yelp' | 'stamp' | 'rise' | 'fall' | 'click' | 'snip' | 'spark' | 'scan' | 'boo' | 'talk';

/** A sound at `at` seconds into a beat. `arg` shifts pitch for some sounds. */
export type SfxCue = [at: number, sfx: SfxName, arg?: number];

/** Who speaks a line. Voices live in script/cast.ts. */
export type SpeakerId = 'narrator' | 'you' | 'zombie' | 'friend' | 'aibot';

export interface CastMember {
  /** Label in the script text and speech bubbles. */
  name: string;
  /** Breeze TTS voice description. */
  voice: string;
  /** Seconds of quiet after this speaker's line before the next beat. Default in engine/timeline.ts. */
  pad?: number;
}

export type Cast = Record<SpeakerId, CastMember>;

export interface Cam { x: number; y: number; z: number }

/** A camera that moves with time inside its beat. */
export type CamFn = (S: BeatState) => Cam;

export interface BeatScript {
  /** Stable global id, "<chapter>.<key>". Audio files are named by it. */
  id: string;
  /** The spoken line. A narrator line is also the caption. */
  say?: string;
  /** Who says `say`. Default "narrator". Several speakers each get their own clip and speak together. */
  speaker?: SpeakerId | SpeakerId[];
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
