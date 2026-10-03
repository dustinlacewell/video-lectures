/* What a chapter's scene provides: its look and its draw passes. */

import type { BeatState } from '../engine/beatState';
import type { Cam } from '../script/types';

/** A draw pass. Every frame is a pure function of these inputs. */
export type DrawFn = (S: BeatState, cam: Cam, T: number) => void;

export interface Scene {
  /** Background gradient, top then bottom. The bottom colour is also the fade colour. */
  bg: [string, string];
  /** Card and title-card colour. */
  accent: string;
  /** Screen-space background, drawn before the camera transform. */
  back?: DrawFn;
  /** World-space drawing, inside the camera transform. */
  draw: DrawFn;
  /** Screen-space overlay, drawn after the camera transform. */
  over?: DrawFn;
}
