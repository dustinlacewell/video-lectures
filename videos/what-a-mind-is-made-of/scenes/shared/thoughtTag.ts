/* The "Thought experiment" tag: a small screen-space label at the top left, from the start of the
   zombie thought experiment through the chapters built on it. Draw it in a scene's `over` pass. */

import type { BeatState } from '@studio/engine/beatState';
import { A } from '@studio/engine/canvas';
import { circ, fillRR } from '@studio/engine/draw';
import { C } from '@studio/engine/palette';
import { tw, txt } from '@studio/engine/text';

const X = 26, Y = 22, SIZE = 20, H = 36;

/** `from`: the beat key the tag fades in at. Without it the tag is shown for the whole chapter. */
export function thoughtTag(S: BeatState, from?: string): void {
  const a = from ? S.on(from, 0.3, 0.6) : 1;
  if (a <= 0) return;
  const w = 42 + tw('Thought experiment', SIZE, 600) + 16;
  A(a * 0.55); fillRR(X, Y, w, H, H / 2, '#0C0828');
  A(a * 0.9);
  cloud(X + 22, Y + H / 2);
  txt('Thought experiment', X + 42, Y + H / 2 + 1, SIZE, C.cream, 'left', 600);
  A(1);
}

/** A small thought cloud: three puffs and a trail of two dots. */
function cloud(x: number, y: number): void {
  circ(x - 4, y + 1, 6, C.cream); circ(x + 3, y - 3, 7, C.cream); circ(x + 8, y + 2, 5, C.cream);
  circ(x - 9, y + 8, 2.2, C.cream); circ(x - 12, y + 12, 1.4, C.cream);
}
