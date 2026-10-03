# Notes ledger

Every note the human gives, recorded as said, split into atoms, and
traced to what it became: a structural fix, a tool, a checklist item, a
document entry, or a taste fix. The ledger is how the producer proves
each note became a check, so the same kind of defect does not reach the
human twice.

## Why it exists

The human's notes in the reference production came as one dense list
of about 25 items after one viewing. Most were a precision, consistency,
clarity, framing, or rhythm defect that a machine or a critic could have
caught. Without a record, a fix closes the note but the class of defect
stays open, and the next chapter repeats it. The ledger is the input to
the [notes-to-checks loop](../loops/notes-to-checks.md).

## Owner and flow

- Recorder: the producer. It writes the human's words verbatim the
  moment they arrive, before doing anything else with them.
- Classifier: [director](../roles/director.md). Splits notes into atoms
  and picks class and outcome, as in the loop.
- Each atom's outcome is carried out by the owner of the target file
  (project checklist, tool, document). The producer briefs that owner; it
  does not edit the target itself.
- [QA](../roles/qa.md) closes a row only when the fix is verified and
  the check exists at the path given.

## Where it lives

`production/notes-ledger.md` in the video repo. One file for the whole
production, newest round on top. Rounds are numbered within the file.

## Format

```markdown
# Notes ledger: <video title>

## Round <n>: <what was watched> — build <commit>, <date>

| Id | Note (verbatim) | Atom | Where | Verified on frame (time, path) | Class | Outcome | Produces | Status |
|---|---|---|---|---|---|---|---|---|
| R<n>-<k> | "<human's words>" | <one defect, one place> | <beat id> @ <m:ss> | <m:ss.s>, <sheet or screenshot path>: <what it shows> | precision / consistency / clarity / framing / rhythm / taste | structural / tool / checklist / document / taste / none | <path and item> | <status> |

### Pairs
- R<n>-<k>: "<draft, verbatim>" → "<human's fix, verbatim>"
```

Status values:

| Status | Means |
|---|---|
| `open` | Not fixed yet. Has an owner. |
| `fixed` | The fix landed and QA verified it. Closes a taste row. |
| `check-added` | Fixed, and the check exists at the "Produces" path. Closes every other row. |
| `human-decision: Q<n>` | Waits on a question put to the human. Every atom that attacks a [bible](bible.md) entry gets this status. |
| `held: <what>` | The fix is known but waits on a human answer or another row's fix. Name it. |
| `settled: B<n>` | The bible already decides this point; the atom does not say the entry is wrong. No fix. The human is told in one line. |
| `no-action: <why>` | Not a defect: working as designed, or the evidence does not show it. |

Rules:

- One row per atom. A note with three defects is three rows sharing the
  note text.
- "Verified on frame" is filled before the row is classified
  ([notes to checks](../loops/notes-to-checks.md), step 1). For a text
  note, the transcript line and its time count as the frame.
- "Produces" names a path: a checklist line in
  `production/checks/<role>.md`, a tool file, a test, or a document
  entry id. "Taste" rows name the writing rule
  they fed, if any.
- A note that matches an existing check is a failed check. Say which
  kind. "Check wrong: <path>": the check ran and passed the defect; fix
  the checklist line. "Check never ran: <path>": the line is fine; fix
  the schedule that skipped it.

## How it is checked

- QA, at the end of each round: every row has a closed status or an
  owner; every "Produces" path exists and contains the item; every row
  has its "Verified on frame" cell.
- Director: two or more taste rows with the same move become a rule in
  [writing](style-guide/writing.md).

## Filled example: "What a Mind Is Made Of"

An excerpt, in this file's format. Round 3 is the real cold-viewer run
in [cold-viewer review](../loops/cold-viewer-review.md) plus the tool
runs on the same cut; its human questions are not answered yet. Rounds 1
and 2 come from the human's real notes; timestamps were not recorded,
beat ids were. Full real version:
`D:\code\ai\cognition\production\notes-ledger.md` (29 rows in round 3).
The real file predates the "Verified on frame" column and marks closed
rows `verified`; the cells of that column below come from the same
frames and transcript.

```markdown
# Notes ledger: What a Mind Is Made Of

## Round 3: cold viewers (newcomer, skeptic, expert) and tools on the cut — build 1b6be63, 2026-10-03

| Id | Note (verbatim) | Atom | Where | Verified on frame (time, path) | Class | Outcome | Produces | Status |
|---|---|---|---|---|---|---|---|---|
| R3-1 | cold-viewer/all (3): "Inventory chapter (4:36–5:28) repeats the zombie chapter" | inventory restates zombie.pain's claim (the zombie keeps everything) [spine: inventory job; spine defect "Repetition"] | inventory.* @ 4:36–5:28 vs zombie.pain @ 4:18 | transcript: zombie.pain 4:18 and inventory make one claim | rhythm | document | spine row inventory (director, after Q2). Role check `Repeated claim` in roles/script-editor.md never ran on the whole script: check failed | human-decision: Q2 |
| R3-4 | cold-viewer/all (3): "'No moral or ethical import' (6:35) arrives without any ethical argument" | chain claim C9 has no reason beat [B1, B2; spine defects "Compression", "Unannounced frame"] | animals.trivia @ 6:35 | transcript 6:35: the claim, no reason before it | precision | document | production/checks/script-editor.md #2 | human-decision: Q1 |
| R3-9 | cold-viewer/all (3): "'Yes. Obviously. I am experiencing this right now.' heard three times (3:13, 4:05, and once more)" | planted line and its payoff. The third instance has no timestamp and is not in the transcript (likely the two-clip chorus counted twice) [spine setup/payoff; B10, B11] | words.ans2 @ 3:13, zombie.yes @ 4:05 | transcript: two instances; the third has no time and is not there | rhythm | none | none | settled: B10, B11 |
| R3-12 | cold-viewer/newcomer (1): "star over head (3:55) meaning only from the label" | the label carries the meaning, as designed. Feeds the held star question | zombie.diff @ 3:55 | — | clarity | none | none | no-action: as designed |
| R3-16 | cold-viewer/skeptic (1): "grey blob with a star at 5:55 reads as dead/empty though experience is kept" | picture says more than the line [vocabulary `star`; grey = absent] | subtract.s2c @ 5:55 | — | clarity | document | vocabulary row change, if approved. Art-director proposal, then one human question (shared kit look) | held: art-director proposal |
| R3-23 | tool: "'Thismachinery' missing space in the body.name card (2:27) — likely rich-text wrap bug" | words touch during the card's word pop-in. Not a wrap bug: the settled frame at 2:29.4 is correct. Every card pops words the same way | body.name @ 2:27.2; all 7 cards | 2:27.2 words overlap; 2:29.4 settled card correct, sheet 04-body-3.png | framing | structural | test/card.test.ts: pure card word layout, no two words overlap at any time. Engine owner | open |
| R3-27 | tool: "Beats after cards: body.list, words.cause" | beat after a chapter card [B13; bible Open] | body.list @ 2:32, words.cause @ 3:29 | — | rhythm | structural | test/card-last.test.ts (not in the repo yet) | human-decision: Q5 |

## Round 2: voiced build — after voice cloning, before export

| Id | Note (verbatim) | Atom | Where | Verified on frame (time, path) | Class | Outcome | Produces | Status |
|---|---|---|---|---|---|---|---|---|
| R2-1 | each line sounds slightly different | voice design rerolls the speaker per call | every voiced beat | — | consistency | structural | script/cast.ts: one frozen ref per speaker; bible B12 | check-added |
| R2-2 | lines cut off | player stops clips 20–80 ms early on its own clock | various | — | rhythm | structural + tool | player lets each clip end; render verify rejects mid-sound endings | check-added |

## Round 1: first full watch of the ported page

| Id | Note (verbatim) | Atom | Where | Verified on frame (time, path) | Class | Outcome | Produces | Status |
|---|---|---|---|---|---|---|---|---|
| R1-1 | "particle"→"particles" | wrong grammatical number in a claim | physics.atoms | — | precision | checklist | production/checks/script-editor.md #6; writing W2 | check-added |
| R1-2 | close-up domino half off screen | prop crosses frame edge | physics.atoms | — | framing | checklist | production/checks/animation-supervisor.md #2 | check-added |
| R1-3 | three green checkmarks while "searching for other forces" unclear | symbol with no fixed meaning | physics.laws | — | clarity | document | visual-vocabulary `check`, `probe` | check-added (probe + label) |
| R1-4 | cut "same play, different performance" | decorative metaphor, second example | form.marble | — | taste | taste | writing W6 | fixed |
| R1-5 | extra panel after a chapter's conclusion card breaks the standard of the video | beat after a card | form.back | — | rhythm | structural | test: no beat after a card; bible B13 | human-decision: Q2, Q5 (form.back cut; body.list, words.cause, animals.end and the missing inventory card remain, R3-27 to R3-29) |
| R1-6 | brain should show constant background neural activity | picture begs the question the line answers | body.brain | — | consistency | checklist | production/checks/animation-supervisor.md #3; bible B17 | check-added |
| R1-7 | saw/learned/wanted shouldn't sit on one neuron | picture claims more than the line | body.trace | — | precision | checklist | production/checks/animation-supervisor.md #3; bible B18 | check-added |
| R1-8 | arms render behind eyes/mouth | draw order in the shared bean | all beans | — | framing | structural | kit/bean.ts draws arms over the face | check-added |
| R1-9 | use the spirit instead of the ghost | one character per concept | body.nogap | — | consistency | document | bible B16; visual-vocabulary `visitor` | check-added |
| R1-10 | "nothing it is like" contradicts the zombie reporting experience | stipulation contradicted by a later line | zombie.diff | — | consistency | document + checklist | bible B4; writing W4 | check-added |
| R1-11 | "Let's try a thought experiment" | appeal to authority | zombie.intro | — | taste | document | bible B5; writing W5 | check-added |
| R1-12 | bean shading looks bad | — | all beans | — | taste | taste | kit/bean.ts new shading | fixed |

### Pairs
- R1-1: "Everything around you is made of the same few kinds of particle, pushed by the same few forces." → "...kinds of particles..."
- R1-4: "Marbles and a rocker can add too. The same play, in a different performance." → (cut)
- R1-10: "One difference. The zombie has no inner conscious experience." / "There is nothing it is like to be the zombie. No felt redness. No felt pain." → "For the sake of the experiment, give it one difference: no inner experience. No lights on inside."
- R1-11: "Philosophers built a thought experiment for exactly this." → "Let’s try a thought experiment."
```

## Notes on the example

- R1-5 is the row that matters most. The note was fixed where the human
  saw it (form.back was cut), but the class was not closed. The test it
  should have produced fails on three other chapters today, and round 3
  found the same defect again (R3-27).
- R3-23 shows why the "Verified on frame" column comes first. The tool's
  guess named the wrong file. The frames named the right one.
- R1-3's class came back in a new place: the checkmark later meant three
  other things. A "document" outcome without a matching
  animation-supervisor checklist line does not hold.
