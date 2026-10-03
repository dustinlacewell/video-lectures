/* Background music: a drone pad tuned to the chapter root, and a step sequencer. */

import { AU, tone } from './synth';

const STEP = 0.52;
const PATTERN = [0, 2, 4, 1, 3, 5, 2, -1, 0, 3, 4, 2, 5, 3, 1, -1];
const DEFAULT_ROOT = 220;
const DEFAULT_SCALE = [0, 3, 5, 7, 10, 12];

export interface MusicKey { root?: number; scale?: number[] }

/** Advance the sequencer to time T. Plays at most one step per call. */
export function auMusic(T: number, ch: MusicKey): void {
  if (!AU.ctx) return;
  const x = AU.ctx, root = ch.root || DEFAULT_ROOT, scale = ch.scale || DEFAULT_SCALE;
  if (AU.root !== root) {
    AU.root = root;
    AU.po[0].frequency.setTargetAtTime(root / 2, x.currentTime, 0.6);
    AU.po[1].frequency.setTargetAtTime(root * 0.75, x.currentTime, 0.6);
    AU.po[2].frequency.setTargetAtTime(root, x.currentTime, 0.6);
  }
  const n = Math.floor(T / STEP);
  if (n !== AU.step) {
    AU.step = n;
    if (!AU.on) return;
    const k = PATTERN[n % 16];
    if (k >= 0) tone(root * Math.pow(2, scale[k % scale.length] / 12) * (n % 32 >= 16 ? 2 : 1), 0, 0.5, 'triangle', 0.035, AU.fx);
    if (n % 8 === 0) tone(root / 2, 0, 0.9, 'sine', 0.07, AU.fx);
  }
}

export function auPad(on: boolean): void {
  if (AU.ctx) AU.pad.gain.setTargetAtTime(on && AU.on ? 0.05 : 0, AU.ctx.currentTime, 0.3);
}

/** Mute or unmute everything. */
export function setSound(on: boolean, playing: boolean): void {
  AU.on = on;
  if (AU.ctx) AU.master.gain.setTargetAtTime(AU.on ? 0.9 : 0, AU.ctx.currentTime, 0.05);
  auPad(playing);
}
