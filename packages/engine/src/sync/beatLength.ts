/* Pure: how long a beat runs once its actions are placed. The voice sets the base length; actions may only extend it. */

import type { ActionSpec, ResolvedAction } from './actions';

/** Seconds of stillness after an ordinary action before its beat may end. */
export const ACTION_HOLD = 0.6;
/** Seconds after a payoff (a result the viewer must take in) before its beat may end. */
export const PAYOFF_HOLD = 1.2;

/** The hold `spec` asks for; undefined when it may run past its beat (hold: 'none'). */
export function holdOf(spec: ActionSpec): number | undefined {
  if (spec.hold === 'none') return undefined;
  return spec.hold ?? (spec.payoff ? PAYOFF_HOLD : ACTION_HOLD);
}

/** When the last held action and its hold are over, from the beat start; undefined when no action holds the beat. */
export function actionsEnd(acts: ResolvedAction[]): number | undefined {
  let end: number | undefined;
  acts.forEach(function (a) {
    const hold = holdOf(a.spec);
    if (hold !== undefined) end = Math.max(end ?? 0, a.t1 + hold);
  });
  return end;
}

/** max(base, actions end + tail). `tail` keeps a chapter's fade-out from eating the last beat's hold. */
export function syncedLength(base: number, acts: ResolvedAction[], tail: number): number {
  const end = actionsEnd(acts);
  return end === undefined ? base : Math.max(base, end + tail);
}
