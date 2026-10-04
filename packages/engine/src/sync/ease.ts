/* Pure: the named curves an action's progress can follow. Names, not functions, so actions stay plain data. */

import { back, cl, ease, easeIn, easeOut } from '../math';

export type EaseName = 'ease' | 'linear' | 'in' | 'out' | 'back';

const CURVES: Record<EaseName, (x: number) => number> = { ease: ease, linear: cl, in: easeIn, out: easeOut, back: back };

export function curveOf(name: EaseName): (x: number) => number {
  return CURVES[name];
}
