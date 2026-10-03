/* Pure: per-frame findings -> time ranges per drawn text or image. */

import { classify, overflow, type DrawnBox, type Edge, type FrameSpec } from './classify.ts';

export type Severity = 'clipped' | 'margin';

/** One box in one sampled frame that crosses the frame edge or the safe margin. */
export interface Hit { t: number; step: number; box: DrawnBox; verdict: Severity; edges: Edge[]; depth: number }

export interface Range {
  kind: DrawnBox['kind'];
  text: string;
  /** The worst verdict seen in the range. */
  verdict: Severity;
  from: number;
  to: number;
  /** Seconds, counting the last sample's step. */
  dur: number;
  edges: Edge[];
  /** Deepest crossing in canvas pixels. */
  depth: number;
  /** The sample with the deepest crossing. */
  worst: Hit;
  samples: number;
}

/** The findings in one sampled frame. */
export function hitsOf(t: number, step: number, boxes: DrawnBox[], f: FrameSpec): Hit[] {
  return boxes.flatMap(function (box): Hit[] {
    const v = classify(box, f);
    if (v !== 'clipped' && v !== 'margin') return [];
    const o = overflow(box, f, v === 'clipped' ? 0 : f.margin);
    return [{ t: t, step: step, box: box, verdict: v, edges: o.edges, depth: o.depth }];
  });
}

/** Join hits of the same text in consecutive samples. Ranges shorter than `minDur` (a box sliding
    through the edge during a camera move) go to `brief` instead of `kept`. */
export function mergeRanges(hits: Hit[], minDur: number): { kept: Range[]; brief: Range[] } {
  const groups = new Map<string, Hit[]>();
  hits.forEach(function (h) {
    const k = h.box.kind + '|' + h.box.text;
    groups.set(k, (groups.get(k) ?? []).concat([h]));
  });
  const all: Range[] = [];
  groups.forEach(function (g) {
    g.sort(function (a, b) { return a.t - b.t; });
    let cur: Hit[] = [];
    g.forEach(function (h) {
      const last = cur[cur.length - 1];
      if (last && h.t - last.t > 1.5 * last.step + 1e-9) { all.push(toRange(cur)); cur = []; }
      cur.push(h);
    });
    if (cur.length) all.push(toRange(cur));
  });
  all.sort(function (a, b) { return a.from - b.from || a.text.localeCompare(b.text); });
  return {
    kept: all.filter(function (r) { return r.dur >= minDur - 1e-9; }),
    brief: all.filter(function (r) { return r.dur < minDur - 1e-9; })
  };
}

function toRange(hs: Hit[]): Range {
  const worst = hs.reduce(function (w, h) { return rank(h) > rank(w) ? h : w; });
  const edges = Array.from(new Set(hs.flatMap(function (h) { return h.edges; })));
  const first = hs[0], last = hs[hs.length - 1], times = new Set(hs.map(function (h) { return h.t; }));
  return {
    kind: first.box.kind, text: first.box.text, verdict: worst.verdict, from: first.t, to: last.t,
    dur: last.t - first.t + last.step, edges: edges, depth: worst.depth, worst: worst, samples: times.size
  };
}

/** Clipped beats margin; deeper beats shallower. */
function rank(h: Hit): number { return (h.verdict === 'clipped' ? 1e6 : 0) + h.depth; }
