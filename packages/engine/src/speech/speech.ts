/* Character lines: a speaking bean flaps its mouth, and its line shows in a speech bubble.
   A scene calls speech(S) once, passes talk(id) to each bean it draws, then draws the bubbles on top. */

import type { BeatState } from '../beatState';
import { bubble, type BubbleOpts } from '../text';
import { shownLines, talkTime, type Holds } from './speechTiming';

/** Where a speaker's bubble points (its tail tip, in world space) and how it looks. */
export interface Spot extends BubbleOpts { x: number; y: number; size?: number }

/** Speaker id -> its bubble spot. */
export type Spots = Partial<Record<string, Spot>>;

export interface Speech {
  /** For BeanOpts.talk: seconds into this speaker's line while it speaks, else undefined. */
  talk(who: string): number | undefined;
  /** Draw every shown line from its speaker's spot. Speakers without a spot are skipped. */
  bubbles(spots: Spots): void;
}

/** Base text size; lines of one or two words show larger. */
const SIZE = 30, SHORT_WORDS = 2, SHORT_SCALE = 1.3;

export function speech(S: BeatState, holds?: Holds): Speech {
  return {
    talk: function (who) { return talkTime(S, who); },
    bubbles: function (spots) {
      shownLines(S, holds).forEach(function (l) {
        const sp = spots[l.who];
        if (sp) bubble(l.beat.say!, sp.x, sp.y, sizeOf(l.beat.say!, sp.size || SIZE), { ...sp, scale: l.scale });
      });
    }
  };
}

function sizeOf(say: string, base: number): number {
  return say.trim().split(/\s+/).length <= SHORT_WORDS ? base * SHORT_SCALE : base;
}
