/* Pure: which frames to render, and which frames to spot-check. */

/** Frames `first .. first + count - 1` of the whole video; frame n shows T = n / fps. */
export interface FramePlan {
  fps: number;
  first: number;
  count: number;
  /** Seconds of the first frame, and of the slice. */
  start: number;
  dur: number;
  /** Frames in the whole video: ceil(total * fps). */
  whole: number;
}

/** The whole video, or the slice [from, to) snapped to frames. Throws on an empty or out-of-range slice. */
export function framePlan(total: number, fps: number, from?: number, to?: number): FramePlan {
  const whole = Math.ceil(total * fps - 1e-9);
  const first = from === undefined ? 0 : Math.max(0, Math.round(from * fps));
  const last = to === undefined ? whole : Math.min(whole, Math.round(to * fps));
  if (last <= first) throw new Error('empty slice: --from ' + from + ' --to ' + to + ' of ' + total.toFixed(2) + ' s');
  return { fps: fps, first: first, count: last - first, start: first / fps, dur: (last - first) / fps, whole: whole };
}

/** T of frame n. */
export function frameTime(n: number, fps: number): number {
  return n / fps;
}

/** Frame numbers to compare against the page: first, last, and the middle of the first beat of each chapter in the slice.
    At most `max`, sorted, no repeats. */
export function spotFrames(plan: FramePlan, beatMids: number[], max = 10): number[] {
  const last = plan.first + plan.count - 1;
  const inside = beatMids.map(function (t) { return Math.round(t * plan.fps); }).filter(function (n) { return n > plan.first && n < last; });
  const picks = [plan.first, last].concat(spread(inside, Math.max(0, max - 2)));
  return Array.from(new Set(picks)).sort(function (a, b) { return a - b; });
}

/** Up to k items, evenly spread over the list. */
function spread(xs: number[], k: number): number[] {
  if (xs.length <= k) return xs;
  const out: number[] = [];
  for (let i = 0; i < k; i++) out.push(xs[Math.floor((i + 0.5) * xs.length / k)]);
  return out;
}
