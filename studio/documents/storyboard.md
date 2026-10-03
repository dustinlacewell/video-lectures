# Storyboard

One board per beat. Each board says what the viewer must understand when
the beat ends, what is on screen, how the camera frames it, and which
symbols it uses. In a code-animated project the boards are data, so the
player can draw them as an [animatic](animatic.md) before any scene is
animated.

## Why it exists

- In the reference production, animators worked from the script line
  alone. They chose each beat's picture on their own, and some pictures
  claimed more or less than the line: three checkmarks during
  "searching for other forces" that nobody could read; saw, learned, and
  wanted drawn on one neuron; a brain with no background activity, which
  made "fired because others fired first" beg the question. A board with
  a stated purpose gives the critic something to check the frame against.
- Chapter agents invented symbols locally. A board names its symbols by
  [visual vocabulary](style-guide/visual-vocabulary.md) id, so a new
  symbol shows up as an unknown id before anyone draws it.
- Boards are what the animatic shows. Without them the first time
  anyone sees pacing is after animation, when fixes are expensive.

## Owner and flow

- Owner: [director](../roles/director.md). Writes `purpose` for every
  beat first, from the spine.
- Picture fields: [art-director](../roles/art-director.md); on the lean
  track, the director. Fills in `frame`, `camera`, `symbols`, `figures`,
  `still`. Purpose and picture fields are written in turn on a chapter
  file, never at once, so each file has one writer at a time.
- Critic: the [script-editor](../roles/script-editor.md), with the
  [board checklist](../roles/director.md#board-checklist), in a [maker-critic loop](../loops/maker-critic.md):
  boards mode on the full track, the combined pass on lean. The director
  never critiques its own boards.
- Readers: [animator](../roles/animator.md) (the board is the brief for
  the beat), [animation-supervisor](../roles/animation-supervisor.md)
  (checks the finished frame against the board's purpose). Never a
  [cold viewer](../loops/cold-viewer-review.md).
- A picture needs a symbol that has no vocabulary row: the board's
  writer stops and proposes the row to the vocabulary owner. The board
  uses the id only after the row exists (it may be PROPOSED, not yet
  drawn).
- After animation starts, an animator who wants a different picture
  proposes it to the director. A purpose change goes to the director; a
  new symbol goes to the vocabulary owner first.

## Where it lives

- `production/storyboard/types.ts`: the board type.
- `production/storyboard/<NN-chapter>.ts`: one file per chapter, named
  like the chapter's script file (`script/05-zombie.ts` →
  `production/storyboard/05-zombie.ts`). It exports a map from beat id
  to board.
- `production/storyboard/stills/<beat-id>.png`: optional rough stills.
- Parallel art-director agents may each own one chapter file. The types
  file has one owner.

`tsconfig.json` MUST include `production`, so `wm build` type-checks the
boards ([engine contract](../engine/contract.md) section 11).

The spoken line is not copied into the board. The renderer reads it from
the script by beat id, so a reworded line never makes a board stale.

## Format

```ts
// production/storyboard/types.ts
/** One board. Keyed by beat id. */
export interface Board {
  /** What the viewer must understand when this beat ends. One sentence. */
  purpose: string;
  /** What is on screen, in words. Every drawn element is written {id}. */
  frame: string;
  /** Framing and movement, in words. Once animated, the script's `cam` is the truth. */
  camera: string;
  /** Every vocabulary id the frame and figures use. */
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
- **Symbols by id.** In `frame`, every drawn element that carries
  meaning is written as its vocabulary id in braces: `{door}`,
  `{host-hand}`. Plain words describe only position, motion and timing.
  Text that appears on screen is quoted: `"no extra push found"`.
- `symbols` lists every `{id}` in `frame` and every figure id.
- `figures` uses vocabulary ids. The renderer maps each id to its kit
  function, so boards show the real characters, posed still.

## How it is checked

**The storyboard test**, `test/storyboard.test.ts`. Cheap, exact, runs
on every `wm test`. It parses the Symbols and Sounds tables of
`production/style-guide/visual-vocabulary.md` (format in
[visual vocabulary](style-guide/visual-vocabulary.md)) and fails when:

1. a chapter has a board file, and a beat in it with a `say` has no
   board;
2. a board key is not a beat id;
3. a board's `purpose` is missing or empty;
4. a `{id}` in `frame`, a `symbols` id or a figure id is not in the
   vocabulary;
5. a `{id}` in `frame` is missing from `symbols`;
6. a `frame` has no `{id}` at all;
7. a sound the script uses (a beat's `sfx` or a chapter's `cues`) has
   no Sounds row.

The test checks only what exists. With zero board files and no sound
cues it passes, even before the vocabulary file exists. An `SfxName`
that nothing uses needs no row. So a new project that inherits the
reference's `SfxName` list is green before anyone writes the Sounds
table.

Coverage is the director's check: at the end of
[preproduction](../phases/preproduction.md), every chapter has a board
file.

The test sees only marked ids. The mark rule is what makes an undefined
symbol visible. In the dry run of this skill, boards passed a test that
checked only `symbols`, while their frame text named an "arrow" with no
vocabulary row. Under the mark rule the writer must write `{arrow}`,
and the test fails; or leaves "arrow" bare, and the board checklist's
"Unmarked or new word" item fails it.

**The terminology grep** ([terminology](style-guide/terminology.md))
also runs on quoted text in `frame`. A quoted label is on-screen text.

**The board checklist**, per chapter: four items in
[director](../roles/director.md#board-checklist). The script-editor
applies it. Each failure cites the board key and quotes the field.

**[Animation-supervisor](../roles/animation-supervisor.md)**, after
animation: the rendered frame at the beat's end does not show the
purpose. Evidence: screenshot path and the purpose text.

## Filled example: "What a Mind Is Made Of"

Reconstructed: the production had no boards. These are the boards the
art-director would have written for the final script. The first is the
beat where the real production went wrong. As first drafted:

```ts
// production/storyboard/01-physics.ts
import type { Boards } from './types';

export const boards: Boards = {
  'physics.laws': {
    purpose: 'Physicists searched matter for any other push and found none.',
    frame: 'The {lattice} close-up stays. Three {check} marks pop over it, one per law.',
    camera: 'Close on the left domino, slow pull back.',
    symbols: ['lattice', 'check']
  }
};
```

The test passes it: both ids are in the vocabulary. The script-editor's
board pass fails it on "Unsupported": `check` does not mean "tested" in the vocabulary,
so the picture does not support the line. The fix is a new row,
`probe` ("instruments looking for a push"), proposed to the
art-director. The board becomes:

```ts
frame: 'The {lattice} close-up stays. A {probe} drifts across it; a label pops: "no extra push found".',
symbols: ['lattice', 'probe']
```

That is what the human asked for in the notes round. With a board, it
happens before anyone animates it.

```ts
// production/storyboard/05-zombie.ts
import type { Boards } from './types';

export const boards: Boards = {
  'zombie.copy': {
    purpose: 'The zombie is an exact physical copy of you.',
    frame: '{you-bean} stands left. A {scan} sweeps down you and, in step, builds an identical {zombie-bean} on the right. A {name-tag} ZOMBIE pops. {thought-tag} top left.',
    camera: 'Two-shot, both figures full height.',
    symbols: ['you-bean', 'zombie-bean', 'scan', 'name-tag', 'thought-tag'],
    figures: [{ id: 'you-bean', x: 400, y: 600, s: 1.55 }, { id: 'zombie-bean', x: 880, y: 600, s: 1.55, note: 'half scanned' }]
  },
  'zombie.diff': {
    purpose: 'The zombie lacks one thing only: inner experience, by stipulation.',
    frame: 'A lit {star} above each head. The {zombie-bean}\'s star flickers and goes out to the unlit form. Labels: "inner experience", "no inner experience". {thought-tag} stays.',
    camera: 'Same two-shot.',
    symbols: ['you-bean', 'zombie-bean', 'star', 'thought-tag'],
    figures: [{ id: 'you-bean', x: 400, y: 600 }, { id: 'zombie-bean', x: 880, y: 600 }, { id: 'star', x: 400, y: 236 }, { id: 'star', x: 880, y: 236, note: 'unlit' }]
  },
  'zombie.yes': {
    purpose: 'You and the zombie give the same answer, in the same voice.',
    frame: '{you-bean} and {zombie-bean} speak together, a quarter second apart. Two identical {bubble}s. {thought-tag} stays.',
    camera: 'Same two-shot.',
    symbols: ['you-bean', 'zombie-bean', 'bubble', 'thought-tag']
  },
  'zombie.must': {
    purpose: 'The same answer has the same physical causes in both.',
    frame: 'A small {brain} lights in each head with the same firing pattern. Between them: "same response", an {arrow} up from "same physics". {thought-tag} stays.',
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
