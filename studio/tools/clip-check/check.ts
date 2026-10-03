/* Pure: compare timeline beats with voice clips. */

import type { Beat } from '../shared/beats.ts';
import type { ClipLengths } from '../shared/contract.ts';

export interface CheckRules {
  /** A beat longer than this many times its speech is dead air. */
  deadAirRatio: number;
  /** Seconds of quiet the engine adds after a line (the contract's default pad). */
  pad: number;
  /** Timing slack in seconds. */
  eps: number;
}

export const DEFAULT_RULES: CheckRules = { deadAirRatio: 2, pad: 0.6, eps: 0.01 };

export interface Missing { beat: string; start: number; clips: string[] }
export interface Overflow { beat: string; start: number; clip: string; /** Seconds the clip runs past the beat end. */ over: number }
export interface DeadAir { beat: string; start: number; kind: string; dur: number; speech: number; ratio: number }
export interface Override { beat: string; start: number; explicit: number; voiced: number; /** Seconds the script's dur adds beyond clip + pad. */ added: number }

export interface ClipReport {
  spoken: number;
  missing: Missing[];
  overflow: Overflow[];
  deadAir: DeadAir[];
  overrides: Override[];
  /** Clip lengths that no beat uses. */
  orphans: string[];
  /** Manifest entries with no clip length (never rendered), and expected clips the manifest lacks. Empty without a manifest. */
  unrendered: string[];
  notInManifest: string[];
}

/** `beats` are the beats to check; `allBeats` the whole video, used to tell orphans. */
export function checkClips(beats: Beat[], allBeats: Beat[], clips: ClipLengths, manifestIds: string[] | undefined, rules: CheckRules = DEFAULT_RULES): ClipReport {
  const spoken = beats.filter(function (b) { return b.lines.length > 0; });
  const r: ClipReport = { spoken: spoken.length, missing: [], overflow: [], deadAir: [], overrides: [], orphans: [], unrendered: [], notInManifest: [] };
  spoken.forEach(function (b) { checkBeat(b, clips, rules, r); });
  const used = new Set(allBeats.flatMap(function (b) { return b.lines.map(function (l) { return l.clip; }); }));
  r.orphans = Object.keys(clips).filter(function (id) { return !used.has(id); }).sort();
  if (manifestIds) {
    const listed = new Set(manifestIds);
    r.unrendered = manifestIds.filter(function (id) { return !clips[id]; }).sort();
    r.notInManifest = Array.from(used).filter(function (id) { return !listed.has(id); }).sort();
  }
  return r;
}

function checkBeat(b: Beat, clips: ClipLengths, rules: CheckRules, r: ClipReport): void {
  const absent = b.lines.filter(function (l) { return !clips[l.clip]; }).map(function (l) { return l.clip; });
  if (absent.length) { r.missing.push({ beat: b.id, start: b.start, clips: absent }); return; }
  b.lines.forEach(function (l) {
    const over = l.at + clips[l.clip] - b.dur;
    if (over > rules.eps) r.overflow.push({ beat: b.id, start: b.start, clip: l.clip, over: over });
  });
  const speech = Math.max(...b.lines.map(function (l) { return l.at + clips[l.clip]; }));
  if (b.dur > rules.deadAirRatio * speech) r.deadAir.push({ beat: b.id, start: b.start, kind: b.kind, dur: b.dur, speech: speech, ratio: b.dur / speech });
  const voiced = speech + rules.pad;
  if (b.explicitDur !== undefined && b.explicitDur > voiced + rules.eps) r.overrides.push({ beat: b.id, start: b.start, explicit: b.explicitDur, voiced: voiced, added: b.explicitDur - voiced });
}
