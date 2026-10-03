# Harvest

Not built. Proposal.

Harvest is how a production's inventions become studio capital. It judges each invention and promotes the ones that will be used again. Three kinds: assets, code, process.

## The role: librarian

A studio-level role, not a production role. Real studios have an asset library department that takes finished work in, names it, and makes it findable. Here:

- **Owns:** `packages/library/**`, the catalog build, `videos/<slug>/golden/**` blesses that a promotion requires, and the harvest ledger `packages/library/harvest.json`.
- **Must not touch:** `script/`, `scenes/`, `production/` of any video, `studio/roles/*.md` (the producer owns check promotion, notes-to-checks step 7).
- **Model:** Opus. A promotion that changes a rig's options or a shot template's params gets a design pass first.
- **Critic:** the guard ([guards.md](guards.md)) is the first critic: every finished video must still match its goldens. Then QA checks the catalog entry: preview renders, test has a negative control, card fields filled.
- **Runs:** continuous and end of production, below.

The kit owner (a production role, one animator per round) still draws new symbols for the video. The librarian decides what leaves the video.

## When

**Continuous.** After each merge of a chapter round, the librarian reads the diff of `scenes/` and `kit/` for inventions: a new draw function, a new pose, a symbol marked "local to" in the vocabulary, an engine helper written inside a scene. It writes one line per candidate into `harvest.json` with status `seen`. Cost: one Sonnet run per merge. Nothing is promoted yet. The point is that nothing is forgotten.

**End of production.** In post, after the final cut and before delivery, the librarian runs the promotion pass over every `seen` candidate. This is the one-time cost of a production that the sizing table gains: about 4 runs (librarian, guard, QA, fix).

## Criteria

Promote when all hold:

- **Reusable.** Used in two beats or two videos, or clearly general (a hat, a sulk, a two-bean conversation). A one-video gag stays.
- **Pure.** Draw code is a function of options and time. A pose takes progress. A sound renders deterministically. Code that reads a beat id is not ready.
- **Nameable.** It has one meaning or one job that fits in one line of plain words. If the line needs "and", split it.
- **Owner-free.** It names no beat, no chapter, no character of one video.

Do not promote: anything still in a vocabulary Conflicts section; anything the human called taste; anything with an open ledger row.

## The steps

For one candidate:

1. **Extract.** Move the code to `packages/library/src/<kind>/<name>/`. `git mv` when it is a whole file.
2. **Generalize.** Constants become options. The old call site passes the old constants. A time offset becomes progress.
3. **Name.** Catalog id `<kind>.<name>`. Plain summary. Origin video and beat.
4. **Test.** Pure part: a unit test with a negative control. Draw part: determinism (`T=30` cold equals played). Shot template: `make(sample)` compiles and resolves.
5. **Preview.** The card's preview spec renders headless. The librarian looks at the PNG.
6. **Catalog.** `wm catalog:build` includes the card. The video's vocabulary row gains `library:`.
7. **Guard.** `wm guard --all`. Every finished video matches its goldens. If a video changed on purpose (a fix the human wanted everywhere), the human watches that video and blesses.

A candidate that fails a step goes back to `seen` with the reason. The ledger row is the memory.

```ts
// packages/library/harvest.json
interface HarvestRow {
  from: { video: string; files: string[]; beat?: string };
  what: string;                 // 'ghost sulk pose', 'neural field background'
  kind: 'asset' | 'code' | 'process';
  status: 'seen' | 'promoted' | 'declined' | 'blocked';
  id?: string;                  // catalog id once promoted
  reason?: string;
  on: string;                   // ISO date
}
```

## Code capital

Engine features invented inside a video follow the same steps, but land in `packages/engine` and the engine owner is the maker; the librarian only files the row. From the first production: speech bubbles and talk windows (`scenes/shared/speech*.ts`), rich text with italic spans, safe-area clamping, the board renderer, the parity tool as the guard. Studio-design Part A moves these in stage 1.

## Process capital

A check line, a writing rule or a brief block becomes skill text. The producer promotes it by notes-to-checks step 7 (names no one-video thing; a second production hit it; written in the role file's format). The librarian's end-of-production pass adds one step: it lists every `production/checks/<role>.md` line and every writing rule from the finished video in `harvest.json` as `seen`, so the next production's producer finds the twin without reading the old repo.

## From the first production

What the end-of-production pass would promote today:

| Candidate | Kind | Id |
|---|---|---|
| bean, hand, ghost, spirit, thought, crow, dog, octopus, aibot | asset | `character.*` |
| sulk, hop, point, reach poses | asset | `pose.bean.*` |
| badges and icons | asset | `prop.badge`, `symbol.badge` |
| star (spark) | asset | `prop.spark`, `symbol.star` |
| neural field (`03-body.network.ts` `activity`) | asset | `background.neuralField` |
| domino, lever, pulley | asset | `prop.*` |
| nine sounds | asset | `sound.*` |
| four voices | asset | `voice.*` |
| title card, chapter card, two beans talking, checklist, visitor try, lineup | asset | `shot.*` |
| speech bubbles, rich text, safe area, board renderer, sync engine, guard | code | engine, tools |
| W2–W11 writing rules, three checks files | process | skill, when a second production hits them |

Declined: `titleArt.ts` (this video's title picture), `thoughtTag.ts` (one video's label, until a second hypothetical video), the truth table.
