# Library: symbols

Not built. Proposal.

The visual vocabulary across the series. A symbol is a picture element with one meaning: the star, the check, the red X, the causal arrow, the badge. A video's vocabulary is a subset of the series symbols plus its own local additions.

## Why a series-level list

The first production found `check` with four meanings in one video and `yellow` meaning both "inner experience" and "cognition". The per-video vocabulary catches that inside a video. A second video would start the drift again from zero. A series list makes the meaning travel with the symbol.

## Data shape

```ts
// packages/library/src/symbols/symbol.ts
export interface Symbol {
  id: string;                       // 'symbol.star'
  look: string;                     // plain words: 'lit: yellow four-point star with glow; unlit: dashed grey outline'
  drawnBy: string;                  // '@studio/library/props/spark#spark'
  means: string;                    // one meaning
  neverMeans: string[];             // near meanings it must not carry
  states?: Record<string, string>;  // 'lit': 'present', 'unlit': 'absent'
  color?: string;                   // palette key, if the color is part of the meaning
}
```

The symbol card is the library form of the vocabulary row (`visual-vocabulary.md`, "Format"). The row's "Used at" column is computed per video, not stored.

## Where it lives

```
packages/library/src/symbols/   star.ts, check.ts, fail.ts, rejectCross.ts, arrow.ts, badge.ts, strike.ts, question.ts
```

The draw code lives with the prop or character it belongs to. The symbol file holds the meaning and points at the code.

## How a video uses it

The video's `production/style-guide/visual-vocabulary.md` keeps its Symbols table. A row either cites a library symbol or declares a local one:

```markdown
| `star` | library: symbol.star | | | | zombie.diff, inventory, subtract |
| `thought-tag` | pill reading "Thought experiment" | `scenes/shared/thoughtTag.ts` | this beat is hypothetical | | physics.*, zombie.* |
```

The storyboard test resolves `library:` rows through the catalog data. A board that cites `star` gets the library's meaning. An animation supervisor's check "a symbol on screen with a meaning not in its row" now has one row for the whole series.

## Conflicts

A video that needs a library symbol to mean something else does not edit the card. It asks the art director for a new symbol with a new look. The library's `neverMeans` list grows from each resolved conflict. From the first production: `check` never means "tested" or "chosen"; `arrow` never means "reveals".

## How an item gets in

Harvest reads the finished video's vocabulary. A row with one settled meaning, drawn by a library prop, becomes a symbol card. A row still in the Conflicts section does not. A row that names a beat or a character of the video stays local.

## Preview

The catalog draws each symbol in each state at 96 px, with `means` beside it and `neverMeans` in grey.
