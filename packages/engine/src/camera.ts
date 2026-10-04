/* Pure: the camera at any moment. Cameras are resolved per beat once, at build time. */

import type { Cam, CamFn } from './script';
import { mkS, type BeatState } from './beatState';
import { ease, lerp } from './math';
import type { TimedChapter } from './timeline';

const HOME: Cam = { x: 640, y: 360, z: 1 };
const DEFAULT_CAM_T = 1.8;
const DRIFT = 0.03;

/** For each beat, the camera of the nearest beat at or before it that sets one. */
export function resolveCams(beats: { cam?: Cam | CamFn }[]): (Cam | CamFn | undefined)[] {
  let cur: Cam | CamFn | undefined;
  return beats.map(function (b) { if (b.cam) cur = b.cam; return cur; });
}

function camOf(ch: TimedChapter, i: number, S: BeatState): Cam {
  const cm = ch.cams[i];
  if (!cm) return { x: HOME.x, y: HOME.y, z: HOME.z };
  return typeof cm === 'function' ? cm(S) : cm;
}

/** Ease from the previous beat's camera, then add a slow zoom drift. */
export function camAt(ch: TimedChapter, S: BeatState): Cam {
  let cur = camOf(ch, S.bi, S);
  const b = S.b;
  if (S.bi > 0) {
    const prev = camOf(ch, S.bi - 1, mkS(ch, b.start - 0.001));
    const u = ease(S.bt / (b.camT || DEFAULT_CAM_T));
    cur = { x: lerp(prev.x, cur.x, u), y: lerp(prev.y, cur.y, u), z: Math.exp(lerp(Math.log(prev.z), Math.log(cur.z), u)) };
  }
  const drift = b.still ? 0 : DRIFT * S.lp;
  return { x: cur.x, y: cur.y, z: cur.z * (1 + drift) };
}
