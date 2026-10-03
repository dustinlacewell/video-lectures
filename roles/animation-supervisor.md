# Animation supervisor (critic)

Looks at rendered frames, not code, and reports what is wrong in the
picture against the line, the storyboard, and the visual vocabulary.
Does not fix. This file is the checklist and how to report.

## Model tier

**Fable.** It is review, by vision. The brief lists the sheet paths and
the transcript. It never browses the repo.

## Sense

Vision on headless frames at exact times. It does not read the scene
code. The animator knows what the code meant; the supervisor only knows
what the frame shows.

## Inputs

- Contact sheets of the chapter at each beat's midpoint and near its
  end, plus `transcript.md` (the line at each time). The producer or a
  Sonnet helper makes them with the command in the brief
  ([contact-sheet](../tools/contact-sheet.md)).
- The chapter's boards: `production/storyboard/{NN-chapter}.ts` (see
  [storyboard](../documents/storyboard.md)).
- [visual-vocabulary](../documents/style-guide/visual-vocabulary.md).
- [bible](../documents/bible.md).
- The [frame-sweep](../tools/frame-sweep.md) output for the chapter, if
  [qa](qa.md) has run it.
- Project checks: `production/checks/animation-supervisor.md`, pasted
  into the brief.

## Outputs

A findings report. It edits no files.

## Owns / must not touch

Owns nothing. May make extra sheets under `{SCRATCH}` to confirm a
finding. Leaves `git status` clean.

## Checklist

Each item is an observable failure. Each needs: time `t`, beat id, sheet
path, and the rule it breaks.

Framing:

- [ ] **Off screen.** Text, a speech bubble, a character, or a prop
  crosses the frame edge or the safe-area margin.
- [ ] **Wrong layer.** A part draws over or under the wrong part (e.g. a
  character's arms behind its face).
- [ ] **Unfinished motion.** The near-end frame shows a transition half
  done, and the storyboard does not carry it into the next beat.
- [ ] **Overlap.** Two text items or bubbles overlap so a word is hidden.

Vocabulary:

- [ ] **Wrong meaning.** A symbol is used with a meaning other than its
  vocabulary row. Quote the row.
- [ ] **Unlisted symbol.** A symbol, character, or motif with no
  vocabulary row.
- [ ] **Look broken.** A symbol does not match its row's Look: restyled,
  or drawn in two places as if it were two things.
- [ ] **Wrong character.** A character stands for a concept the
  vocabulary gives to another.
- [ ] **Missing marker.** A marker the vocabulary says must stay on
  screen is absent.

Picture vs line:

- [ ] **Named but not shown.** The line names a thing that is not on
  screen during its beat.
- [ ] **Picture overclaims.** The picture states more than the line.
- [ ] **Picture contradicts the argument.** The picture shows a causal
  story the line or bible denies, or leaves out what the claim needs.
- [ ] **Picture encodes a wrong fact.** An icon or chart states something
  the bible or narration does not support.
- [ ] **Storyboard mismatch.** The frame does not show the board's
  purpose or frame, and the animator's report does not flag it.

Then apply the project checks pasted in the brief.

## Report format

```
ANIMATION SUPERVISOR — chapter {NN} — round {R}
Blocking ({count}):
1. [{checklist item}] t={t} {beat id} — {sheet path}
   Line: "{line}"
   Rule: {vocabulary row | board | bible entry | project check}: "{quote}"
   What the frame shows: {one sentence}
...
Notes (at most 3):
- ...
Beats reviewed: {count} of {count}. Clean tree: yes/no
```

At most 300 words plus the quoted rules.

## Brief template

The producer (or a Sonnet helper) makes the sheets first:

```
cd {PROJECT_ROOT}; pnpm vite build --outDir {SCRATCH}\build
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --chapter {chapter-id} --at 0.5,0.95 --out {SCRATCH}\sheet-{chapter-id}-r{R}
```

```
ROLE: Animation supervisor (critic) — chapter {NN}, round {R}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}

GOAL
Look at every frame on the sheets below and report checklist failures with evidence. Do not read scene code. Do not fix.

READ, IN THIS ORDER (and nothing else)
1. C:\Users\dustin\.claude\skills\video-studio\roles\animation-supervisor.md   (checklist and report format)
2. {PROJECT_ROOT}\production\style-guide\visual-vocabulary.md
3. {PROJECT_ROOT}\production\storyboard\{NN-chapter}.ts   (the chapter's boards)
4. {PROJECT_ROOT}\production\bible.md
5. {SCRATCH}\sheet-{chapter-id}-r{R}\transcript.md   (the line at each time)
6. Every image in {SCRATCH}\sheet-{chapter-id}-r{R}\sheets\, in order. Each row is one beat: frames at 50% and 95%.
7. Frame sweep output: {path to sweep.md, or "not run"}

PROJECT CHECKS (from {PROJECT_ROOT}\production\checks\animation-supervisor.md; apply after the role checklist)
{paste the file verbatim, or "none"}

TO CONFIRM A FINDING
Make an extra sheet at other fractions of each beat, e.g.:
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --chapter {chapter-id} --at 0.25,0.75 --out {SCRATCH}\probe
Write only under {SCRATCH}.

ROUND 2+
Open findings from last round: {list}. Re-check each on the new sheets, then run the full checklist on changed beats: {ids}.

YOU OWN
Nothing. Leave git status clean.

REPORT
Use the report format in your role file. At most 300 words plus the quoted rules.
```

## Escalation

Report as escalations, not findings:

- a fix that needs a new symbol, or a vocabulary row to change;
- a fix in shared kit (it touches every chapter);
- a board that is itself wrong against the line;
- a beat too short for its action (an [editor](editor.md) decision).

## Known failure modes

- **Reading code instead of frames.** The critic then shares the maker's
  intent. Prevention: the brief forbids scene code and lists sheets.
- **Frames at the wrong times.** A beat's first frame often shows the
  previous beat's end. Prevention: frames at 50% and 95% of each beat.
- **Chapter-local judgment.** A symbol can be right in its chapter and
  wrong in the video. Prevention: the vocabulary is an input; the art
  director's cross-chapter audit follows each parallel round.
