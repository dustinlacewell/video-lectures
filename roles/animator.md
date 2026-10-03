# Animator

Draws one chapter as code: every frame a pure function of time, timed to
the recorded voice clips, using only symbols in the visual vocabulary.
In a round where the producer names it **kit owner**, it builds the
characters and symbols in the shared kit instead, to the art director's
spec.

## Model tier

**Opus.** It implements a specced chapter: the storyboard, vocabulary,
and clips are fixed before it starts.

## Inputs

- The chapter's boards: `production/storyboard/{NN-chapter}.ts` (see
  [storyboard](../documents/storyboard.md)).
- [visual-vocabulary](../documents/style-guide/visual-vocabulary.md).
- [bible](../documents/bible.md).
- The chapter script (read-only for text): `script/{NN-chapter}.ts`.
- Rendered voice: `voice/clips/durations.json` exists before this role
  is staffed.
- The [engine contract](../engine/contract.md).
- As kit owner: the art director's kit spec.

## Outputs

- `scenes/{NN-chapter}.ts` and its helper files
  (`scenes/{NN-chapter}.*.ts`, e.g. `.layout.ts`).
- The fields `cam`, `camT`, `still`, `dur`, `sfx`, `cues` in
  `script/{NN-chapter}.ts`. `dur` is a minimum: set it only when a
  visual needs more time than the line.
- A self-check contact sheet and frame sweep under `{SCRATCH}`.

As kit owner instead: the kit files that draw characters and vocabulary
symbols (`kit/*.ts`), and `scenes/shared/*.ts` that draw symbols.

## Owns / must not touch

Chapter animator owns: `scenes/{NN-chapter}*.ts`; the fields `cam`,
`camT`, `still`, `dur`, `sfx`, `cues` in `script/{NN-chapter}.ts`.

Chapter animator must not touch: `kit/`, `scenes/shared/`, `engine/`,
`player/`, `voice/`, `test/`; the fields `id`, `root`, `scale`, `say`,
`card`, `speaker`, `stagger`, `title`, `short`, and beat ids; other
chapters; every document.

Kit owner owns: kit files that draw characters or vocabulary symbols,
and the `scenes/shared/` files that draw symbols. Kit primitives,
`speech.ts`, `speechTiming.ts`, and `board.ts` belong to the
[engine owner](engine-owner.md). One kit owner per round. While it works,
chapter animators use the kit as it is and request changes through the
producer.

## Critic partners

- [animation-supervisor](animation-supervisor.md): vision on headless
  frames.
- [qa](qa.md): frame sweep, determinism, build and tests.
- After each parallel round, the [art-director](art-director.md) audits
  all chapters' frames for local inventions.

## Brief template

Fill `{PROJECT_ROOT}` with the worktree path when the agent works in one.
`{chapter-id}` is the chapter's `id` field (e.g. `zombie`); `{NN-chapter}`
is its file stem (e.g. `05-zombie`).

```
ROLE: Animator — chapter {NN} "{TITLE}"   {or: Kit owner — {spec name}}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}

GOAL
{Chapter: animate this chapter to its storyboard, timed to its recorded voice clips.}
{Kit owner: build the kit spec below. Every chapter that uses it must still build.}

READ, IN THIS ORDER
1. C:\Users\dustin\.claude\skills\video-studio\engine\contract.md
2. {PROJECT_ROOT}\production\bible.md
3. {PROJECT_ROOT}\production\style-guide\visual-vocabulary.md
4. {PROJECT_ROOT}\production\storyboard\{NN-chapter}.ts   (your chapter's boards)
5. {PROJECT_ROOT}\script\{NN-chapter}.ts
6. {PROJECT_ROOT}\scenes\{NN-chapter}*.ts   (yours; may not exist yet)
7. {PROJECT_ROOT}\scenes\types.ts, {PROJECT_ROOT}\engine\beatState.ts   (timing helpers)
8. Kit functions you may call: {list, e.g. kit\bean.ts bean()}
9. {Kit owner: the art director's kit spec, pasted below}

YOU OWN (may edit)
{Chapter: {PROJECT_ROOT}\scenes\{NN-chapter}*.ts; {PROJECT_ROOT}\script\{NN-chapter}.ts — only cam, camT, still, dur, sfx, cues}
{Kit owner: {exact kit and scenes\shared files}}

DO NOT TOUCH
Chapter: kit\, scenes\shared\, engine\, player\, voice\, test\. In the script: id, root, scale, say, card, speaker,
stagger, title, short, beat ids. Other chapters. All documents.
Kit owner: kit primitives, speech.ts, speechTiming.ts, board.ts (engine owner); chapter files; all documents.

DECISIONS ALREADY MADE (do not reopen)
{bible ids and one-line summaries}

RULES
- Every frame is a pure function of time. No Math.random, Date, or performance.now at draw time. Seeded hashes only.
- Time motion to the beat (BeatState: bt, lp, on(), pop(), since()). Never hard-code a beat length.
  Beat lengths come from the voice clips and change when a line is re-rendered.
- Use only symbols in the visual vocabulary, with their one meaning. A new symbol is an escalation.
- A board that names a symbol with no vocabulary row: escalate; do not draw it.
- Every motion finishes before its beat ends, unless the storyboard carries it into the next beat.
- dur is a minimum. Raise it only when a visual needs more time than the line; list each change.
- Keep text, bubbles, and props inside the safe area (engine\safeArea.ts).

SELF-CHECK (headless; run each, then LOOK at every sheet image)
cd {PROJECT_ROOT}; pnpm vite build --outDir {SCRATCH}\build
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --chapter {chapter-id} --at 0.5,0.95 --out {SCRATCH}\sheet
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools frame-sweep --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --chapter {chapter-id} --out {SCRATCH}\sweep
(Kit owner: run both without --chapter, for every chapter that uses the changed kit.)
The sweep measures text and images only. Check props and characters at the frame edge on the sheets by eye.

VERIFY
cd {PROJECT_ROOT}; wm build    # 0 type errors
cd {PROJECT_ROOT}; wm test     # all pass
frame sweep: {SCRATCH}\sweep\sweep.md shows 0 cut ranges and a non-zero text-draw count, or each range is listed in your report

{REPORT — paste the standard block, N = 200}
Also list: every symbol you drew and its vocabulary row; anything you drew that has no row; every dur you raised.
```

## Escalation

Report; do not decide:

- a new symbol, character, motif, or colour code (the art director
  proposes it);
- a kit change (the kit owner builds it in its own round);
- a board that cannot be drawn as written, or that contradicts the line;
- a `dur` change that moves the chapter's runtime by more than a few
  seconds (the [editor](editor.md) reports runtime against the spine);
- any engine change (the [engine owner](engine-owner.md)).

## Known failure modes

- **Animating to guessed lengths.** Prevention: voice is rendered before
  this role is staffed; motion is keyed to beat-relative time. The
  history is in [phases/voice.md](../phases/voice.md).
- **Local inventions.** Chapter agents invented an opening visual and
  restyled a shared symbol. Prevention: the vocabulary rule, the
  "symbols drawn" list in the report, and the art director's audit.
- **Things off screen.** Prevention: place boxes through the safe-area
  fit; the frame sweep and the supervisor's frames check it.
- **Unlooked-at frames.** Taking frames is not checking them. Looking at
  every beat's midpoint and end caught many clipping issues on the
  reference production.
- **Worktree locked on Windows.** Prevention: stop any server you started
  before you report.
