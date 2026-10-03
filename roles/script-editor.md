# Script editor (critic)

Reads the script and the boards cold, as text, against the spine, bible,
writing guide, and terminology. Reports observable failures with quoted
evidence. Does not rewrite.

- **Owns:** nothing. Probe notes go under `{SCRATCH}`. Leaves
  `git status` clean.
- **Must not touch:** every file.
- **Model:** Fable. The brief names every file it reads.
- **Sense:** cold context. It never sees a maker's report or reasoning.
  It reads the whole script in order, because most failures span
  chapters.
- **Brief template:** [below](#brief-template). Modes: combined (lean),
  script, boards, spine.

## Modes

- **Combined (lean).** One pass: the [script checklist](#script-checklist)
  on the whole script, and the director's
  [board checklist](director.md#board-checklist) on every chapter's
  boards. At most one fix round follows.
- **Script (full).** The script checklist, once all writers finish. One
  loop on the whole script, not one per chapter.
- **Boards (full).** The board checklist only.
- **Spine (full).** The director's
  [spine checklist](director.md#spine-checklist).

## Script checklist

Each item is an observable failure. Quote lines exactly, with beat id.

Argument and structure:

- [ ] **Repeated claim.** The same claim is stated in two chapters.
  Evidence: both lines, both beat ids, and which spine job owns it.
- [ ] **No new idea.** A run of beats adds no new claim, step, or
  example; each restates the one before. Evidence: the beat ids and
  what each restates.
- [ ] **Off-job content.** A beat makes a point that is not its
  chapter's job and not a listed setup or payoff. Evidence: the line and
  the spine row.
- [ ] **Missing opening claim.** The first spoken beat does not state
  the spine's opening claim. Evidence: both texts.
- [ ] **Past the card.** A beat follows the chapter's card, and the bible
  lists no exception. Evidence: the beat ids.
- [ ] **Card is not the claim.** The card differs from the spine card, or
  is not a full declarative sentence. Evidence: both texts.
- [ ] **Unpaid setup / unset payoff.** Evidence: the spine row and beat
  ids.

Truth:

- [ ] **False or unsupported claim.** A line states something false, or
  something the video and the bible's stipulations do not support.
  Evidence: the claim, and a counterexample or the missing support.

Consistency:

- [ ] **Stipulation contradicted.** A later line contradicts a
  stipulation. Evidence: both lines.
- [ ] **Term drift.** A term is used outside its terminology meaning, a
  synonym replaces a table term, or a "Do not use" word appears.
  Evidence: the line and the row.
- [ ] **Bible reopened.** A line reverses or softens a bible decision.
  Evidence: the line and the entry.
- [ ] **Speaker mismatch.** A character's words go to the narrator, or a
  chorus line differs between its speakers. Evidence: the beat.

Precision:

- [ ] **Unnamed cause.** "Has to", "must", "because" where the line
  should name the cause. Evidence: the line and the thesis step.
- [ ] **Mis-aimed attribution.** A view is attributed without the part
  that makes it the target. Evidence: the line.
- [ ] **Grammar.** Number or agreement is wrong. Evidence: the line.
- [ ] **Overclaim or underclaim.** A line states more or less than the
  spine job. Evidence: the line and the job.

Voice:

- [ ] **Writing-guide breach.** Evidence: the line and the rule.
- [ ] **Unspeakable text.** `say` holds symbols, digits, or
  abbreviations a voice model may misread. Evidence: the line.

Then apply the project checks pasted in the brief.

## Report format

```
SCRIPT EDITOR — {mode} — round {R}
Blocking ({count}):
1. [{checklist item}] {beat id or board key} ({file}:{line}) — "{quote}"
   vs {rule source}: "{quote}"
   Why it fails: {one sentence}
...
Notes (at most 3, maker may ignore):
- ...
Clean tree: yes/no
```

At most 300 words plus the quotes (combined: 400). No rewrites unless
the brief asks for one suggested wording per finding.

## Brief template

```
ROLE: Script editor (critic) — {combined script and boards | script | boards | spine} review, round {R}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}
SCRATCH: {PROJECT_ROOT}\.scratch\script-editor-r{N}   (gitignored; probe notes go here)

GOAL
Find observable failures against the checklists named below. Do not fix anything.

CHECKLISTS
{Combined: "Script checklist" in C:\Users\dustin\.claude\skills\video-studio\roles\script-editor.md, then
 "Board checklist" in C:\Users\dustin\.claude\skills\video-studio\roles\director.md, per chapter.}
{Script: "Script checklist" in roles\script-editor.md.   Boards: "Board checklist" in roles\director.md.
 Spine: "Spine checklist" in roles\director.md.}
Report format: "Report format" in roles\script-editor.md.

READ, IN THIS ORDER (and nothing else)
1. The checklist sections above
2. {PROJECT_ROOT}\production\spine.md
3. {PROJECT_ROOT}\production\bible.md
4. {PROJECT_ROOT}\production\style-guide\writing.md
5. {PROJECT_ROOT}\production\style-guide\terminology.md
6. {Script or combined: {PROJECT_ROOT}\script\index.ts, then every chapter file it lists, in order}
7. {Boards or combined: {PROJECT_ROOT}\production\style-guide\visual-vocabulary.md, then
    {PROJECT_ROOT}\production\storyboard\{NN-chapter}.ts for each chapter, with its script file for the lines}

FOCUS
Changed beats or boards: {ids from the makers' reports, or "all (first draft)"}. Check the whole script anyway.
Round 2: open findings from last round: {list}. Confirm each fixed or still open.

PROJECT CHECKS (from {PROJECT_ROOT}\production\checks\script-editor.md; apply after the role checklists)
{paste the file verbatim, or "none"}

YOU OWN
Nothing. Leave git status clean.

REPORT
Use the report format. At most 300 words plus the quotes (combined: 400).
```

## Escalation

Report as escalations, not findings:

- a fix that needs a new term, motif, or symbol;
- a fix that changes a chapter's job or the spine;
- a conflict between two documents (spine vs bible);
- a false claim the spine itself requires.

## Known failure modes

- **Checking only the changed chapter.** Prevention: the whole script,
  every round.
- **Opinions as findings.** Prevention: the evidence rule in
  [maker-critic](../loops/maker-critic.md); an item with no checklist
  line is a note, at most three.
- **No one checks truth.** Consistency checks pass a false claim that
  agrees with itself. Prevention: the truth item.
- **Rewriting.** A critic that rewrites is an unchecked maker.
  Prevention: it owns no files.
