# Animation supervisor (critic)

Looks at rendered frames, not code, and reports what is wrong in the
picture against the line, the storyboard, and the visual vocabulary.
Does not fix. This file is the checklist and how to report.

Real-studio counterpart: the animation supervisor in dailies, who
reviews every shot frame by frame and sends notes back to the animator.

## Model tier

**Fable.** It is review, by vision. The brief lists every frame path and
the line playing at each. It never browses the repo.

## Sense

Vision on headless frames at exact times. It does not read the scene
code. It sees what a viewer sees. The animator knows what the code meant;
the supervisor only knows what the frame shows.

## Inputs

- Frames for the chapter: every beat at its midpoint and at 0.05 s
  before its end, taken with `__seek(t)`. The producer (or a Sonnet
  helper) makes these with the [contact-sheet](../tools/contact-sheet.md)
  tool or the animator's self-check set. Each frame comes with its time,
  beat id, and the line being spoken.
- The chapter's boards: `production/storyboard/{NN-chapter}.ts` (see
  [storyboard](../documents/storyboard.md)).
- [visual-vocabulary](../documents/style-guide/visual-vocabulary.md).
- [bible](../documents/bible.md).
- The [frame-sweep](../tools/frame-sweep.md) output for the chapter, if
  [qa](qa.md) has run it.

## Outputs

A findings report. It edits no files.

## Owns / must not touch

Owns nothing. May take extra frames at other times under `{SCRATCH}` to
confirm a finding. Leaves `git status` clean.

## Checklist

Each item is an observable failure. Each needs: time `t`, beat id,
screenshot path, and the rule it breaks.

Framing:

- [ ] **Off screen.** Text, a speech bubble, a character, or a prop
  crosses the frame edge or the safe-area margin. (Several bubbles and a
  close-up domino sat half off screen.)
- [ ] **Wrong layer.** A part draws over or under the wrong part. (The
  bean's arms rendered behind its eyes and mouth.)
- [ ] **Unfinished motion.** The end-of-beat frame shows a transition
  half done, and the storyboard does not carry it into the next beat.
- [ ] **Overlap.** Two text items or bubbles overlap so a word is hidden.

Vocabulary:

- [ ] **Wrong meaning.** A symbol is used with a meaning other than its
  vocabulary row. Quote the row. (Checkmarks meant "tested" in chapter 1
  and "has it" in chapters 6 and 8.)
- [ ] **Unlisted symbol.** A symbol, character, or motif with no
  vocabulary row. (The chapter 2 opener: a square turning into a circle,
  a "form = function" arrow flipping.)
- [ ] **Look broken.** A symbol does not match its row's Look: restyled,
  or drawn in two places as if it were two things. (The consciousness
  star in two places at once; a restyled "?" bubble.)
- [ ] **Wrong character.** A character stands for a concept the
  vocabulary gives to another. (Ghost where the bible says spirit.)
- [ ] **Missing frame marker.** A hypothetical beat without the
  persistent "Thought experiment" tag, or any other marker the
  vocabulary says must stay on screen.

Picture vs line:

- [ ] **Named but not shown.** The line names a thing that is not on
  screen during its beat. (The consciousness star should show above the
  bean when the line refers to it.)
- [ ] **Picture overclaims.** The picture states more than the line. (Saw,
  learned, and wanted drawn on one neuron implies one neuron per idea.)
- [ ] **Picture contradicts the argument.** The picture shows a causal
  story the line or bible denies, or leaves out what the claim needs.
  (A brain with no background activity makes "fired because others
  fired first" beg the question.)
- [ ] **Picture encodes a wrong fact.** An icon or chart states something
  the bible or narration does not support. (Self-model icons showed
  animals as uncertain; only the AI is uncertain.)
- [ ] **Storyboard mismatch.** The frame does not show the board's
  purpose or frame, and the animator's report does not flag it.

## Report format

```
ANIMATION SUPERVISOR — chapter {NN} — round {R}
Blocking ({count}):
1. [{checklist item}] t={t} {beat id} — {screenshot path}
   Line: "{line}"
   Rule: {vocabulary row | board | bible entry}: "{quote}"
   What the frame shows: {one sentence}
...
Notes (at most 3):
- ...
Frames reviewed: {count} of {count}. Clean tree: yes/no
```

At most 300 words plus the quoted rules.

## Brief template

```
ROLE: Animation supervisor (critic) — chapter {NN}, round {R}
{ENVIRONMENT — paste the standard block from loops/maker-critic.md}

GOAL
Look at every frame below and report checklist failures with evidence. Do not read scene code. Do not fix.

READ, IN THIS ORDER (and nothing else)
1. C:\Users\dustin\.claude\skills\video-studio\roles\animation-supervisor.md   (checklist and report format)
2. {PROJECT_ROOT}\production\style-guide\visual-vocabulary.md
3. {PROJECT_ROOT}\production\storyboard\{NN-chapter}.ts   (the chapter's boards)
4. {PROJECT_ROOT}\production\bible.md
5. Frame list (open each image):
   {t} | {beat id} | "{line}" | {path}
   ...
6. Frame sweep output: {path or "not run"}

TO CONFIRM A FINDING
You may take extra headless frames: {command or tool doc path}. Save under {SCRATCH}.

ROUND 2+
Open findings from last round: {list}. Re-check each on the new frames, then run the full checklist on changed beats: {ids}.

YOU OWN
Nothing. Leave git status clean.

{REPORT — use the report format in your role file}
```

## Escalation

Report as escalations, not findings:

- a fix that needs a new symbol, or a vocabulary row to change;
- a fix in shared kit (it touches every chapter);
- a board that is itself wrong against the line;
- a beat too short for its action (an [editor](editor.md) decision).

## Known failure modes

- **Reading code instead of frames.** The critic then shares the maker's
  intent and misses what is on screen. Prevention: the brief forbids
  scene code and lists frames.
- **Frames at the wrong times.** A beat start often shows the previous
  beat's end. Prevention: midpoint and end-minus-0.05 s, from `__info()`.
- **Chapter-local judgment.** A symbol can be right in its chapter and
  wrong in the video. Prevention: the vocabulary is an input; the art
  director's cross-chapter audit follows each parallel round.
