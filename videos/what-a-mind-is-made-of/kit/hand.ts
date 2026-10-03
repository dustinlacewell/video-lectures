/* A pointing hand. Origin at the fingertip, pointing toward -x. */

import { tf } from '../engine/canvas';
import { ell, fillRR } from '../engine/draw';
import { C } from '../engine/palette';

export function hand(x: number, y: number, s: number, rot?: number): void {
  tf(x, y, s, rot || 0, function () {
    fillRR(92, -30, 70, 62, 10, C.pink); fillRR(92, -30, 70, 62, 10, 'rgba(21,15,51,0.12)');
    fillRR(40, -26, 62, 54, 20, C.skin);
    fillRR(0, -12, 62, 22, 11, C.skin);
    fillRR(46, 6, 30, 16, 8, 'rgba(21,15,51,0.14)'); fillRR(52, 14, 30, 12, 6, 'rgba(21,15,51,0.1)');
    ell(60, -30, 18, 10, C.skin, 0.4);
  });
}
