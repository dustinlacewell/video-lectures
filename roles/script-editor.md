# Script editor (critic)

Reads the script cold, as text, against the spine, bible, writing guide,
and terminology table. Reports observable failures with quoted evidence.
Does not rewrite. This file is the checklist and how to report.

Real-studio counterpart: the story editor, and the script supervisor who
tracks continuity across scenes.

## Model tier

**Fable.** It is review. The brief names every file it reads. It does not
browse the repo.

## Sense

Cold context. It never sees the writer's report or reasoning. It reads
the whole script in order, not only the changed chapter, because most of
its failures span chapters.

## Inputs

- All chapter script files, in order, from `script/index.ts`.
- [spine](../documents/spine.md), [bible](../documents/bible.md),
  [writing](../documents/style-guide/writing.md),
  [terminology](../documents/style-guide/terminology.md).
- The list of changed beat ids from the maker's report (to focus a
  re-check round).

## Outputs

A findings report. Nothing else. It edits no files.

## Owns / must not touch

Owns nothing. May write probe notes under `{SCRATCH}`. Leaves `git status`
clean.

## Checklist

Each item is an observable failure. Each needs the evidence named.
Quote lines exactly, with beat id.

Argument and structure:

- [ ] **Repeated claim.** The same claim is stated in two chapters.
  Evidence: both quoted lines, both beat ids, and which chapter's spine
  job owns the claim. (The original video made one point three times in
  chapters 4–6.)
- [ ] **Off-job content.** A beat makes a point that is not this
  chapter's spine job and not a setup or payoff listed for it. Evidence:
  the line and the spine row.
- [ ] **Missing opening claim.** The chapter's first spoken beat does not
  state its spine opening claim. Evidence: the first line and the spine
  opening claim. (The human asked for the form chapter to open on its thesis.)
- [ ] **Past the card.** A beat follows the chapter's card, and the bible
  lists no exception. Evidence: the card's beat id and the ids after it.
- [ ] **Card is not the claim.** The card text differs from the spine
  card, or is not a full declarative sentence. Evidence: both texts.
- [ ] **Unpaid setup / unset payoff.** A spine setup never pays off, or a
  payoff appears before its setup. Evidence: the spine row and beat ids.

Consistency:

- [ ] **Stipulation contradicted.** A later line contradicts something the
  script stipulated. Evidence: both lines. (The zombie had "nothing it is
  like" to be it, yet it reports experience.)
- [ ] **Term drift.** A term is used outside its terminology-table
  meaning, or a synonym replaces a table term. Evidence: the line and the
  table row.
- [ ] **Bible reopened.** A line reverses or softens a bible decision.
  Evidence: the line and the bible entry. ("Trivia" stays; the zombie
  keeps everything cognitive, including pain.)
- [ ] **Speaker mismatch.** A character's words are given to the narrator,
  or a chorus line differs between its speakers. Evidence: the beat.

Precision:

- [ ] **Unnamed cause.** "Has to", "must", "because" where the line
  should name the cause the argument depends on. Evidence: the line and
  the bible thesis step. ("It has to say that... form is function" →
  "for all the same physical reasons")
- [ ] **Mis-aimed attribution.** A view is attributed without the part
  that makes it the target. Evidence: the line. ("whether they are
  conscious" → "…as if the answer settles how we ought to treat them")
- [ ] **Grammar.** Number or agreement is wrong. Evidence: the line.
  ("particle" → "particles")
- [ ] **Overclaim or underclaim.** A line states more or less than the
  spine job. Evidence: the line and the job.

Voice:

- [ ] **Writing-guide breach.** A line breaks a rule in the writing guide.
  Evidence: the line and the rule. (Example rules from human fixes:
  invite the viewer, do not cite authority; cut a metaphor that adds no
  claim; mark the stressed word that carries the claim.)
- [ ] **Unspeakable text.** `say` contains symbols, digits, or
  abbreviations a voice model may misread. Evidence: the line.

## Report format

```
SCRIPT EDITOR — round {R} — {scope}
Blocking ({count}):
1. [{checklist item}] {beat id} ({file}:{line}) — "{quote}"
   vs {rule source}: "{quote}"
   Why it fails: {one sentence}
...
Notes (at most 3, maker may ignore):
- ...
Clean tree: yes/no
```

At most 300 words plus the quotes. No rewrites offered unless the brief
asks for one suggested wording per finding.

## Brief template

```
ROLE: Script editor (critic) — {script | spine} review, round {R}
{ENVIRONMENT — paste the standard block from loops/maker-critic.md}

GOAL
Find observable failures against the checklist. Do not fix anything.

READ, IN THIS ORDER (and nothing else)
1. C:\Users\dustin\.claude\skills\video-studio\roles\script-editor.md   (your checklist and report format)
   {for spine review: C:\Users\dustin\.claude\skills\video-studio\roles\director.md, section "Spine-mode checklist"}
2. {PROJECT_ROOT}\production\spine.md
3. {PROJECT_ROOT}\production\bible.md
4. {PROJECT_ROOT}\production\style-guide\writing.md
5. {PROJECT_ROOT}\production\style-guide\terminology.md
6. {PROJECT_ROOT}\script\index.ts, then every chapter file it lists, in order

FOCUS
Changed beats: {ids from the maker's report}. Check the whole script anyway; cross-chapter failures count.
Round 2+: open findings from last round: {list}. Confirm each fixed or still open.

YOU OWN
Nothing. Probe notes go in {SCRATCH}. Leave git status clean.

{REPORT — use the report format in your role file}
```

## Escalation

Report as escalations, not findings:

- a failure whose fix needs a new term, motif, or symbol;
- a failure whose fix changes a chapter's job or the spine;
- a conflict between two documents (spine vs bible).

## Known failure modes

- **Checking only the changed chapter.** Cross-chapter repetition is
  invisible from one chapter. Prevention: the brief has it read the whole
  script every round.
- **Opinions as findings.** "This line is weak" is not a finding.
  Prevention: the evidence rule in
  [maker-critic](../loops/maker-critic.md); items without a checklist
  line become notes, at most three.
- **Rewriting.** A critic that rewrites becomes an unchecked maker.
  Prevention: it owns no files.
