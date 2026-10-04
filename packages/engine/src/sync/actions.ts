/* Pure: the animator's actions (what moves when, anchored to words) and their placement in a beat. */

import type { SfxName } from '../audio/sfx';
import type { BeatScript } from '../script';
import type { EaseName } from './ease';
import { wordTime, type VoiceMedia, type WordRef } from './words';

/** When an action starts. */
export type Start =
  /** Seconds from the beat start. */
  | number
  /** A word of the beat's line, plus `shift` seconds. */
  | (WordRef & { shift?: number })
  /** When another action of the beat ends, plus `gap` seconds. */
  | { after: string; gap?: number }
  /** When another action of the beat starts, plus `shift` seconds. */
  | { with: string; shift?: number };

/** A sound the action plays: at its start, at its end, or a number of seconds after its start. */
export type ActionSfx = [when: 'start' | 'end' | number, sfx: SfxName, arg?: number];

export interface ActionSpec {
  at: Start;
  /** Seconds the action runs. */
  dur: number;
  /** The curve of `S.act`. Default 'ease'. */
  ease?: EaseName;
  /** A visual payoff the viewer needs to take in: its default hold is PAYOFF_HOLD, not ACTION_HOLD. */
  payoff?: boolean;
  /** Seconds of stillness after it ends before the beat may end. 'none': it may run past the beat. */
  hold?: number | 'none';
  sfx?: ActionSfx[];
}

/** Action name -> spec, for one beat. */
export type BeatActions = Record<string, ActionSpec>;
/** Beat key -> its actions. Names are unique in the chapter, so a scene reads any of them from any beat. */
export type ChapterActions = Record<string, BeatActions>;
/** Chapter id -> its actions. */
export type VideoActions = Record<string, ChapterActions>;

/** An action placed in its beat. `t0`, `t1`: seconds from the beat start. */
export interface ResolvedAction { name: string; t0: number; t1: number; spec: ActionSpec }

/** Chapter id -> beat key -> its placed actions. */
export type PlacedActions = Record<string, Record<string, ResolvedAction[]>>;

/** Start at a word, `shift` seconds off: `at({ word: 'ghost' }, -0.4)`. */
export function at(ref: WordRef, shift = 0): Start {
  return { ...ref, shift: shift };
}

/** Start at the end of a word or phrase. */
export function atEnd(ref: WordRef, shift = 0): Start {
  return { ...ref, edge: 'end', shift: shift };
}

/** Start `gap` seconds after another action of the beat ends. */
export function after(name: string, gap = 0): Start {
  return { after: name, gap: gap };
}

/** Place every action of beat `b`, in declaration order. Starts before the beat clamp to 0.
    Throws, naming the beat, on an unknown action, a cycle, or a word the line lacks. */
export function resolveActions(b: BeatScript, actions: BeatActions, media: VoiceMedia): ResolvedAction[] {
  const placed: Record<string, ResolvedAction> = {}, open: string[] = [];

  function place(name: string): ResolvedAction {
    const spec = actions[name];
    if (!spec) throw new Error('beat "' + b.id + '": no action "' + name + '"');
    if (placed[name]) return placed[name];
    if (open.indexOf(name) >= 0) throw new Error('beat "' + b.id + '": actions wait on each other: ' + open.concat(name).join(' -> '));
    if (!(spec.dur >= 0)) throw new Error('beat "' + b.id + '": action "' + name + '" needs a dur of 0 or more');
    open.push(name);
    const t0 = Math.max(0, startOf(spec.at));
    open.pop();
    return placed[name] = { name: name, t0: t0, t1: t0 + spec.dur, spec: spec };
  }

  function startOf(s: Start): number {
    if (typeof s === 'number') return s;
    if ('after' in s) return place(s.after).t1 + (s.gap ?? 0);
    if ('with' in s) return place(s.with).t0 + (s.shift ?? 0);
    return wordTime(b, s, media) + (s.shift ?? 0);
  }

  return Object.keys(actions).map(place);
}
