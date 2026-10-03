# Animator

Draws chapters as code: every frame a pure function of time, timed to
the recorded voice clips, using only symbols in the visual vocabulary.
In a round where the producer names it **kit owner**, it builds the
characters and symbols in the shared kit instead, to the art director's
spec.

- **Owns (chapter):** `scenes/{NN-chapter}*.ts`; the fields `cam`,
  `camT`, `still`, `dur`, `sfx`, `cues` in `script/{NN-chapter}.ts`, for
  each chapter in its scope. `dur` is a minimum: raise it only when a
  visual needs more time than the line.
- **Owns (kit owner):** kit files that draw characters or vocabulary
  symbols, and the `scenes/shared/` files that draw symbols. One kit
  owner per round.
- **Must not touch:** `kit/`, `scenes/shared/` (chapter animator);
  kit primitives, `speech.ts`, `speechTiming.ts`, `board.ts` (the
  [engine owner](engine-owner.md)); `engine/`, `player/`, `voice/`,
  `test/`; the fields `id`, `root`, `scale`, `say`, `card`, `speaker`,
  `stagger`, `title`, `short`, and beat ids; chapters outside its scope;
  every document.
- **Model:** Opus. Storyboard, vocabulary, and clips are fixed before it
  starts.
- **Critic:** the [animation-supervisor](animation-supervisor.md).
  Full track also: [qa](qa.md), and the [art-director](art-director.md)'s
  audit after each parallel round. Lean: the producer runs frame-sweep
  and clip-check.
- **Brief template:** [below](#brief-template). Scope: a chapter group
  (lean), one chapter (full), or kit owner.

## Lean: chapter groups

On lean, the producer splits the chapters into 2–3 groups with disjoint
files. One animator per group, in parallel worktrees. Each group gets one
supervisor pass and at most one fix round. Then the producer runs
frame-sweep and clip-check on the merged build and reads the summary
lines.

## Brief template

`{chapter-id}` is the chapter's `id` field (e.g. `zombie`);
`{NN-chapter}` is its file stem (e.g. `05-zombie`). For a group, repeat
`--chapter` per chapter.

```
ROLE: Animator — {chapters {NN list} (group {X}) | chapter {NN} "{TITLE}" | kit owner — {spec name}}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}
SCRATCH: {PROJECT_ROOT}\.scratch\animator-{group or chapter}-r{N}   (gitignored; sheets and sweep go here)

GOAL
{Chapters: animate each chapter in scope to its storyboard, timed to its recorded voice clips.}
{Kit owner: build the kit spec below. Every chapter that uses it must still build.}

READ, IN THIS ORDER
1. C:\Users\dustin\.claude\skills\video-studio\engine\contract.md
2. {PROJECT_ROOT}\production\bible.md
3. {PROJECT_ROOT}\production\style-guide\visual-vocabulary.md
4. {PROJECT_ROOT}\production\storyboard\{NN-chapter}.ts   (each chapter in scope)
5. {PROJECT_ROOT}\script\{NN-chapter}.ts   (each chapter in scope)
6. {PROJECT_ROOT}\scenes\{NN-chapter}*.ts   (yours; may not exist yet)
7. {PROJECT_ROOT}\scenes\types.ts, {PROJECT_ROOT}\engine\beatState.ts   (timing helpers)
8. Kit functions you may call: {list, e.g. kit\bean.ts bean()}
9. {Kit owner: the art director's kit spec, pasted below}

YOU OWN (may edit)
{Chapters: {PROJECT_ROOT}\scenes\{NN-chapter}*.ts; in {PROJECT_ROOT}\script\{NN-chapter}.ts only cam, camT, still, dur, sfx, cues}
{Kit owner: {exact kit and scenes\shared files}}

DO NOT TOUCH
Chapters: kit\, scenes\shared\, engine\, player\, voice\, test\. In the script: id, root, scale, say, card, speaker,
stagger, title, short, beat ids. Chapters outside your scope. All documents.
Kit owner: kit primitives, speech.ts, speechTiming.ts, board.ts (engine owner); chapter files; all documents.

DECISIONS ALREADY MADE (do not reopen)
{bible ids and one-line summaries}

RULES
- Every frame is a pure function of time. No Math.random, Date, or performance.now at draw time. Seeded hashes only.
- Time motion to the beat (BeatState: bt, lp, on(), pop(), since()). Never hard-code a beat length.
- Use only vocabulary symbols, with their one meaning. A board that names a symbol with no row: escalate; do not draw it.
- Cue only sounds with a Sounds row in the vocabulary.
- Every motion finishes before its beat ends, unless the storyboard carries it into the next beat.
- dur is a minimum. Raise it only when a visual needs more time than the line; list each change.
- Keep text, bubbles, and props inside the safe area (engine\safeArea.ts).

SELF-CHECK (headless; run each, then LOOK at every sheet image)
cd {PROJECT_ROOT}; pnpm vite build --outDir {SCRATCH}\build
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --chapter {chapter-id} --at 0.5,0.95 --out {SCRATCH}\sheet
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools frame-sweep --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --chapter {chapter-id} --out {SCRATCH}\sweep
(Kit owner: run both without --chapter. The sweep measures text and images only; check props at the frame edge by eye.)

VERIFY
cd {PROJECT_ROOT}; wm build    # 0 type errors
cd {PROJECT_ROOT}; wm test     # all pass
frame sweep: {SCRATCH}\sweep\sweep.md shows 0 cut ranges and a non-zero text-draw count, or each range is in your report

{REPORT — paste the standard block, N = 200 (group: 300)}
Also list: every symbol you drew and its vocabulary row; anything drawn with no row; every dur you raised; runtime per chapter.
```

## Escalation

Report; do not decide:

- a new symbol, character, motif, or colour code;
- a kit change (the kit owner builds it in its own round);
- a board that cannot be drawn as written, or contradicts the line;
- a `dur` change that moves a chapter's runtime by more than a few
  seconds (the [editor](editor.md) reports runtime against the spine);
- any engine change.

## Known failure modes

- **Animating to guessed lengths.** Prevention: voice is rendered before
  this role is staffed; motion is keyed to beat-relative time.
- **Local inventions.** Prevention: the vocabulary rule and the "symbols
  drawn" list in the report.
- **Things off screen.** Prevention: the safe-area fit; the sweep and the
  supervisor's frames.
- **Unlooked-at frames.** Taking frames is not checking them. Look at
  every beat's midpoint and end.
- **Worktree locked on Windows.** Prevention: stop any server you
  started before you report.
