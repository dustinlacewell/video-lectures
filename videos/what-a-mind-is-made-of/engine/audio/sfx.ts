/* Sound effects by name. Add a sound by adding an entry. */

import type { SfxName } from '../../script/types';
import { AU, hiss, tone } from './synth';

const SOUNDS: Record<SfxName, (p: number) => void> = {
  pop: function (p) { tone(420 + p * 60, 880 + p * 90, 0.11, 'sine', 0.22); },
  unpop: function () { tone(700, 240, 0.16, 'sine', 0.2); },
  tick: function (p) { hiss(0.05, 'bandpass', 2200 + p * 120, 0, 2, 0.5); tone(900 + p * 40, 500, 0.05, 'triangle', 0.12); },
  thud: function () { tone(130, 45, 0.24, 'sine', 0.5); hiss(0.12, 'lowpass', 500, 0, 1, 0.35); },
  whoosh: function () { hiss(0.5, 'bandpass', 300, 2600, 1.2, 0.3, 0.2); },
  swish: function () { hiss(0.28, 'bandpass', 1800, 500, 1.5, 0.22, 0.08); },
  fail: function () { tone(330, 311, 0.2, 'sawtooth', 0.09); tone(247, 185, 0.4, 'sawtooth', 0.1, null, 0.2); },
  ding: function () { tone(880, 0, 0.9, 'sine', 0.16); tone(1320, 0, 0.6, 'sine', 0.07); tone(1760, 0, 0.4, 'sine', 0.04); },
  card: function () {
    tone(523, 0, 0.7, 'sine', 0.14); tone(659, 0, 0.7, 'sine', 0.12, null, 0.09); tone(784, 0, 0.9, 'sine', 0.12, null, 0.18);
    hiss(0.3, 'bandpass', 500, 3000, 1, 0.12, 0.15);
  },
  zap: function (p) { tone(1500 + p * 110, 800, 0.06, 'square', 0.035); },
  blip: function () { tone(1040, 0, 0.035, 'sine', 0.08); },
  yelp: function () { tone(600, 1500, 0.12, 'triangle', 0.2); tone(1500, 500, 0.22, 'triangle', 0.2, null, 0.12); },
  stamp: function () { tone(160, 50, 0.22, 'square', 0.25); hiss(0.14, 'lowpass', 900, 0, 1, 0.5); },
  rise: function () { tone(240, 520, 0.55, 'triangle', 0.1); },
  fall: function () { tone(520, 240, 0.45, 'triangle', 0.08); },
  click: function () { hiss(0.02, 'highpass', 3000, 0, 1, 0.4); tone(1800, 0, 0.03, 'square', 0.05); },
  snip: function () { hiss(0.04, 'highpass', 4000, 0, 1, 0.5); hiss(0.05, 'highpass', 3000, 0, 1, 0.5, 0.005, 0.09); },
  spark: function () { tone(1760, 0, 0.5, 'sine', 0.08); tone(2637, 0, 0.7, 'sine', 0.05, null, 0.06); },
  scan: function () { tone(300, 1200, 1.4, 'sawtooth', 0.03); },
  boo: function () { tone(400, 300, 0.5, 'sine', 0.1); tone(410, 290, 0.5, 'sine', 0.08); },
  talk: function (p) { tone(300 + p * 40, 260 + p * 30, 0.08, 'triangle', 0.1); }
};

export function sfx(type: SfxName, arg?: number): void {
  if (!AU.ctx || !AU.on) return;
  const play = SOUNDS[type];
  if (play) play(arg || 0);
}
