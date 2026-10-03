# Storyboard

One board per beat. Each board says what the viewer must understand when
the beat ends, what is on screen, how the camera frames it, and which
symbols it uses. In a code-animated project the boards are data, so the
player can draw them as an [animatic](animatic.md) before any scene is
animated.

Real-studio counterpart: the storyboard, panel by panel, pinned up and
pitched before layout and animation start.

## Why it exists

- In the reference production, animators worked from the script line
  alone. They chose each beat's picture on their own, and some pictures
  claimed more or less than the line: three checkmarks during
  "searching for other forces" that nobody could read; saw, learned, and
  wanted drawn on one neuron; a brain with no background activity, which
  made "fired because others fired first" beg the question. A board with
  a stated purpose gives the critic something to check the frame against.
- Chapter agents invented symbols locally. A board lists its symbols by
  [visual vocabulary](style-guide/visual-vocabulary.md) id, so a new
  symbol shows up as an unknown id before anyone draws it.
- Boards are what the animatic shows. Without them the first time
  anyone sees pacing is after animation, when fixes are expensive.

## Owner and flow

- Owner: [director](../roles/director.md). Writes `purpose` for every
  beat first, from the spine.
- Picture fields: [art-director](../roles/art-director.md). Fills in
  `frame`, `camera`, `symbols`, `figures`, `still`. The two work in turn
  on a chapter file, never at once, so each file has one writer at a time.
- Critic: the director checks each chapter's boards against the
  [spine](spine.md) and the vocabulary in a
  [maker-critic loop](../loops/maker-critic.md).
- Readers: [animator](../roles/animator.md) (the board is the brief for
  the beat), [animation-supervisor](../roles/animation-supervisor.md)
  (checks the finished frame against the board's purpose).
- After animation starts, an animator who wants a different picture
  proposes it to the director. A purpose change goes to the director; a
  new symbol goes to the art-director first.

## Where it lives

- `production/storyboard/types.ts`: the board type.
- `production/storyboard/<NN-chapter>.ts`: one file per chapter, named
  like the chapter's script file (`script/05-zombie.ts` →
  `production/storyboard/05-zombie.ts`). It exports a map from beat id
  to board.
- `production/storyboard/stills/<beat-id>.png`: optional rough stills.
- Parallel art-director agents may each own one chapter file. The types
  file has one owner.

The spoken line is not copied into the board. The renderer reads it from
the script by beat id, so a reworded line never makes a board stale.

## Format

```ts
// production/storyboard/types.ts
/** One board. Keyed by beat id. */
export interface Board {
  /** What the viewer must understand when this beat ends. One sentence. */
  purpose: string;
  /** What is on screen, in words: who, where, doing what. */
  frame: string;
  /** Framing and movement, in words. Once animated, the script's `cam` is the truth. */
  camera: string;
  /** Ids from production/style-guide/visual-vocabulary.md. */
  symbols: string[];
  /** Rough placement, drawn by the board renderer with the real kit. */
  figures?: Figure[];
  /** File name in production/storyboard/stills/. Drawn instead of `figures`. */
  still?: string;
}

/** A vocabulary symbol placed in the 1280x720 frame. */
export interface Figure { id: string; x: number; y: number; s?: number; note?: string }

export type Boards = Record<string, Board>;
```

Rules:

- Every beat with a `say` has a board. A card beat needs none: the card
  is its own picture.
- `purpose` is a belief or an understanding, not an action. "The
  viewer sees the spark go out" is a frame. "The viewer understands the
  zombie lacks only inner experience" is a purpose.
- `figures` uses vocabulary ids. The renderer maps each id to its kit
  function, so boards show the real characters, posed still.

## How it is checked

- A unit test, `test/storyboard.test.ts`, fails when: a beat with a
  `say` has no board; a board key is not a beat id; a symbol or figure id
  is not in the vocabulary table. Cheap, exact, runs on every change.
- [Director](../roles/director.md), per chapter: a purpose that does not
  serve the chapter's spine job; two adjacent beats with the same
  purpose (one can probably go); a purpose the line does not support.
- [Animation-supervisor](../roles/animation-supervisor.md), after
  animation: the rendered frame at the beat's end does not show the
  purpose. Evidence: screenshot path and the purpose text.

## Filled example: "What a Mind Is Made Of"

Boards the art-director would have written. The first is the beat where
the real production went wrong.

```ts
// production/storyboard/01-physics.ts
import type { Boards } from './types';

export const boards: Boards = {
  'physics.laws': {
    purpose: 'Physicists searched matter for any other push and found none.',
    frame: 'The domino close-up stays. A probe drifts across the particle lattice; a label pops: "no extra push found".',
    camera: 'Close on the left domino, slow pull back.',
    symbols: ['lattice', 'check']
  }
};
```

The director's pass on this board fails it: `check` is not "tested" in
the vocabulary. The fix (a probe and a label, no checkmark) is what the
human asked for in the notes round. With a board, it happens before
anyone animates it.

```ts
// production/storyboard/05-zombie.ts
import type { Boards } from './types';

export const boards: Boards = {
  'zombie.copy': {
    purpose: 'The zombie is an exact physical copy of you.',
    frame: 'You stand left. A cyan scan line sweeps down you and, in step, builds an identical figure on the right. ZOMBIE tag pops.',
    camera: 'Two-shot, both figures full height.',
    symbols: ['you-bean', 'zombie-bean', 'scan', 'name-tag', 'thought-tag'],
    figures: [{ id: 'you-bean', x: 400, y: 600, s: 1.55 }, { id: 'zombie-bean', x: 880, y: 600, s: 1.55, note: 'half scanned' }]
  },
  'zombie.diff': {
    purpose: 'The zombie lacks one thing only: inner experience, by stipulation.',
    frame: 'A lit star above each head. The zombie\'s flickers and goes out to a dashed outline. Labels: "inner experience", "no inner experience".',
    camera: 'Same two-shot.',
    symbols: ['you-bean', 'zombie-bean', 'star', 'thought-tag'],
    figures: [{ id: 'you-bean', x: 400, y: 600 }, { id: 'zombie-bean', x: 880, y: 600 }, { id: 'star', x: 400, y: 236 }, { id: 'star', x: 880, y: 236, note: 'unlit' }]
  },
  'zombie.yes': {
    purpose: 'You and the zombie give the same answer, in the same voice.',
    frame: 'Both mouths move together, a quarter second apart. Two identical bubbles.',
    camera: 'Same two-shot.',
    symbols: ['you-bean', 'zombie-bean', 'bubble', 'thought-tag']
  },
  'zombie.must': {
    purpose: 'The same answer has the same physical causes in both.',
    frame: 'A small brain lights in each head with the same firing pattern. Between them: "same response", an arrow up from "same physics".',
    camera: 'Same two-shot.',
    symbols: ['brain', 'arrow', 'thought-tag']
  }
};
```

A board for `animals.matters` would need the purpose "The viewer
understands that what matters is how sophisticated the cognition is and
how richly it models itself." The director checks that purpose against
the spine and finds that nothing before it explains a self-model. The
board exposes the spine defect before the beat is animated.
