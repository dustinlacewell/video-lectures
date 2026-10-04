import { describe, expect, it } from 'vitest';
import { mkS, type BeatState } from '@studio/engine/beatState';
import { camAt, resolveCams } from '@studio/engine/camera';
import { ease, lerp } from '@studio/engine/math';
import { buildTimeline, type TimedChapter } from '@studio/engine/timeline';
import type { Cam } from '@studio/engine/script';
import { SCRIPT } from '../script';

/* The original's camera: search backwards from the beat each frame. Kept here as the oracle. */
function camOfOriginal(ch: TimedChapter, i: number, S: BeatState): Cam {
  for (let k = i; k >= 0; k--) { const cm = ch.beats[k].cam; if (cm) return typeof cm === 'function' ? cm(S) : cm; }
  return { x: 640, y: 360, z: 1 };
}
function camAtOriginal(ch: TimedChapter, S: BeatState): Cam {
  let cur = camOfOriginal(ch, S.bi, S);
  const b = S.b;
  if (S.bi > 0) {
    const prev = camOfOriginal(ch, S.bi - 1, mkS(ch, b.start - 0.001));
    const u = ease(S.bt / (b.camT || 1.8));
    cur = { x: lerp(prev.x, cur.x, u), y: lerp(prev.y, cur.y, u), z: Math.exp(lerp(Math.log(prev.z), Math.log(cur.z), u)) };
  }
  const drift = b.still ? 0 : 0.03 * S.lp;
  return { x: cur.x, y: cur.y, z: cur.z * (1 + drift) };
}

const tl = buildTimeline(SCRIPT);

describe('resolveCams', () => {
  it('carries the last camera forward to beats without one', () => {
    const a = { x: 1, y: 2, z: 3 }, b = { x: 4, y: 5, z: 6 };
    expect(resolveCams([{}, { cam: a }, {}, {}, { cam: b }, {}])).toEqual([undefined, a, a, a, b, b]);
  });
});

describe('camAt', () => {
  it('matches the original backward search at every 50 ms of the video', () => {
    for (const ch of tl.chapters) {
      for (let t = 0; t < ch.dur; t += 0.05) {
        const S = mkS(ch, t);
        expect(camAt(ch, S)).toEqual(camAtOriginal(ch, S));
      }
    }
  });

  it('starts a beat at the previous camera and settles on its own after camT', () => {
    const ch = tl.chapters.find(c => c.id === 'physics')!;
    const stop = ch.beats[ch.idx['stop']];
    const atStart = camAt(ch, mkS(ch, stop.start));
    expect(atStart.y).toBe(420);
    const settled = camAt(ch, mkS(ch, stop.start + 1.8));
    const lp = 1.8 / stop.dur;
    expect(settled).toEqual({ x: 1290, y: 420, z: 1.5 * (1 + 0.03 * lp) });
  });

  it('does not drift on a still beat', () => {
    const ch = tl.chapters[0];
    expect(camAt(ch, mkS(ch, 5.9))).toEqual({ x: 640, y: 360, z: 1 });
  });

  it('follows a moving camera inside its beat', () => {
    const ch = tl.chapters.find(c => c.id === 'physics')!;
    const fall = ch.beats[ch.idx['fall']];
    const early = camAt(ch, mkS(ch, fall.start + 2)), late = camAt(ch, mkS(ch, fall.start + 5));
    expect(late.x).toBeGreaterThan(early.x);
  });
});
