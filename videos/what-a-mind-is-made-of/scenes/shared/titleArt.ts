/* The title art: big headline, a grinning figure, and its faculties orbiting it. Used at start and end. */

import type { Cam } from '@studio/engine/script';
import { fillRR } from '@studio/engine/draw';
import { TAU } from '@studio/engine/math';
import { C } from '@studio/engine/palette';
import { txt } from '@studio/engine/text';
import { bean } from '@studio/library/characters/bean';
import { badge, type IconKind } from '@studio/library/props/icons';
import { floaters, stars } from '@studio/library/backgrounds/scenery';

export const TITLE_BG: [string, string] = ['#3A2C8C', '#1A1446'];

const ORBIT: [IconKind, string][] = [['memory', C.pink], ['love', C.red], ['talent', C.teal], ['plan', C.purple], ['humor', C.green], ['belief', C.cyan]];

export function titleBack(cam: Cam, T: number): void {
  stars(cam, T, 5, 120, 0.2);
  floaters(cam, T, 8, 14, [C.purple, C.pink, C.cyan], 0.4);
}

export function titleScene(T: number, sub: string): void {
  txt('What a mind', 90, 236, 112, C.cream, 'left', 700);
  txt('is made of', 90, 362, 112, C.cream, 'left', 700);
  fillRR(90, 440, 430, 10, 5, C.yellow);
  txt(sub, 90, 506, 40, C.cyan, 'left', 500);
  orbit(T, false);
  bean({ x: 1040, y: 640, s: 1.55, t: T, color: C.orange, armR: 2.5 + Math.sin(T * 5) * 0.25, look: [-0.6, -0.2], mouth: 'grin' });
  orbit(T, true);
}

/** Badges behind the figure (front=false) or in front of it (front=true). */
function orbit(T: number, front: boolean): void {
  ORBIT.forEach(function (k, i) {
    const a = T * 0.35 + i * TAU / ORBIT.length, y = 286 + Math.sin(a) * 54;
    if ((Math.sin(a) >= 0) === front) badge(k[0], 1040 + Math.cos(a) * 178, y, 36, k[1]);
  });
}
