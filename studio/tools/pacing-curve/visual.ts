/* Pure: a visual-change proxy from small grey frames sampled at a fixed step. */

/** One sample: its time, the share of pixels that differ from the frame of the last significant change,
    and seconds since that change. */
export interface VisualSample { t: number; change: number; since: number }

export interface ChangeRule {
  /** Grey levels (0-255) a pixel must move to count as changed. */
  delta: number;
  /** Share of pixels that must change for the frame to count as a visual change. */
  share: number;
}

export const DEFAULT_RULE: ChangeRule = { delta: 12, share: 0.03 };

/** Share of pixels whose grey level differs by more than `delta`. */
export function changedShare(a: number[], b: number[], delta: number): number {
  if (a.length !== b.length) throw new Error('frames differ in size');
  let n = 0;
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > delta) n++;
  return a.length ? n / a.length : 0;
}

/** Frames in time order -> per-sample change and stillness. Each frame is compared with the frame of the
    last significant change, not the previous frame, so slow drift and small idle motion add up instead of
    hiding under the threshold. The first frame counts as a change. */
export function visualCurve(frames: { t: number; grey: number[] }[], rule: ChangeRule = DEFAULT_RULE): VisualSample[] {
  if (!frames.length) return [];
  let ref = frames[0];
  return frames.map(function (f, i) {
    const change = i === 0 ? 1 : changedShare(ref.grey, f.grey, rule.delta);
    if (change >= rule.share) ref = f;
    return { t: f.t, change: change, since: f.t - ref.t };
  });
}
