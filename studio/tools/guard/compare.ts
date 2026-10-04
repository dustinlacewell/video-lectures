/* Pure: compare a fresh capture against a blessed golden. */

import type { Info } from '../shared/contract.ts';
import type { GoldenSample, Sample } from './samples.ts';

export interface Captured extends Sample { frame: string }

export interface Mismatch { t: number; why: string; expected: string; actual: string }

/** Samples present in `captured` but missing from `golden`, or whose frame hash differs.
    A sample in `golden` but not `captured` is also a mismatch (the timeline shrank). */
export function diffSamples(golden: GoldenSample[], captured: Captured[]): Mismatch[] {
  const byT = new Map(captured.map(function (c) { return [c.t.toFixed(3), c]; }));
  const out: Mismatch[] = [];
  golden.forEach(function (g) {
    const c = byT.get(g.t.toFixed(3));
    if (!c) { out.push({ t: g.t, why: g.why, expected: g.frame, actual: '(no sample at this time)' }); return; }
    if (c.frame !== g.frame) out.push({ t: g.t, why: g.why, expected: g.frame, actual: c.frame });
  });
  return out;
}

/** True when `info` and `golden info` disagree on total runtime or any beat's start time. */
export function infoChanged(golden: string, info: Info): { changed: boolean; now: string } {
  const now = infoDigestInput(info);
  return { changed: now !== golden, now: now };
}

/** The part of __info() the guard holds stable: total plus every beat's [chapter, key, start]. Deterministic string, hashed by the caller. */
export function infoDigestInput(info: Info): string {
  const rows = info.chapters.flatMap(function (c) {
    return c.beats.map(function (b) { return c.id + '|' + b[0] + '|' + (c.start + b[1]).toFixed(3); });
  });
  return info.total.toFixed(3) + ';' + rows.join(';');
}
