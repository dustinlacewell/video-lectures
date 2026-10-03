/* Domino-chain geometry and timing, shared by the physics script (camera, sounds) and scene. */

export const N = 12;
export const dw = 24;
export const dh = 140;
/** Spacing between dominoes. */
export const ds = 72;
/** X of the first domino. */
export const x0 = 200;
export const GY = 520;
/** X of the lone domino at the end. */
export const LONE = 1420;
/** Seconds between successive domino hits. */
export const DELTA = 0.27;
/** Seconds into the "fall" beat when the finger pushes the first domino. */
export const PUSH = 1.1;

/** Lean angle at which a domino touches the next one. */
export const thHit = Math.asin((ds - dw) / dh);
/** Seconds after the push when the last domino lands flat. */
export const LAND = (N - 1) * DELTA + DELTA * Math.sqrt((Math.PI / 2) / thHit);
