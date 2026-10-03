# Notes ledger

Every note the human gives, recorded as said, split into atoms, and
traced to what it became: a structural fix, a tool, a checklist item, a
document entry, or a taste fix. The ledger is how the producer proves
each note became a check, so the same kind of defect does not reach the
human twice.

Real-studio counterpart: the notes log a production coordinator keeps
after each dailies or review session, with who owns each note and when
it closed.

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
  (role checklist, tool, document). The producer briefs that owner; it
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

| Id | Note (verbatim) | Atom | Where | Class | Outcome | Produces | Status |
|---|---|---|---|---|---|---|---|
| R<n>-<k> | "<human's words>" | <one defect, one place> | <beat id> @ <m:ss> | precision / consistency / clarity / framing / rhythm / taste | structural / tool / checklist / document / taste | <path and item> | open / fixed / verified |

### Pairs
- R<n>-<k>: "<draft, verbatim>" → "<human's fix, verbatim>"
```

Rules:

- One row per atom. A note with three defects is three rows sharing the
  note text.
- "Produces" names a path: a checklist line in a role file, a tool file,
  a test, or a document entry id. "Taste" rows name the writing rule
  they fed, if any.
- A note that matches an existing check is a failed check. Mark the
  outcome "check failed: <path>" and fix the checklist line, not only
  the defect.

## How it is checked

- QA, at the end of each round: every row is verified or has an owner;
  every "Produces" path exists and contains the item.
- Director: two or more taste rows with the same move become a rule in
  [writing](style-guide/writing.md).

## Filled example: "What a Mind Is Made Of"

From the real notes rounds. Timestamps were not recorded; beat ids are.

```markdown
# Notes ledger: What a Mind Is Made Of

## Round 2: voiced build — after voice cloning, before export

| Id | Note (verbatim) | Atom | Where | Class | Outcome | Produces | Status |
|---|---|---|---|---|---|---|---|
| R2-1 | each line sounds slightly different | voice design rerolls the speaker per call | every voiced beat | consistency | structural | script/cast.ts: one frozen ref per speaker; bible B12 | verified |
| R2-2 | lines cut off | player stops clips 20–80 ms early on its own clock | various | rhythm | structural + tool | player lets each clip end; render verify rejects mid-sound endings (engine/voice-pipeline.md) | verified |

## Round 1: first full watch of the ported page

| Id | Note (verbatim) | Atom | Where | Class | Outcome | Produces | Status |
|---|---|---|---|---|---|---|---|
| R1-1 | "particle"→"particles" | wrong grammatical number in a claim | physics.atoms | precision | checklist | roles/script-editor.md: number and agreement; writing W2 | verified |
| R1-2 | close-up domino half off screen | prop crosses frame edge | physics.atoms | framing | tool | tools/frame-sweep.md: sweep props, not only text | verified |
| R1-3 | three green checkmarks while "searching for other forces" unclear | symbol with no fixed meaning | physics.laws | clarity | document | visual-vocabulary `check` | verified (probe + label) |
| R1-4 | cut "same play, different performance" | decorative metaphor, second example | form.marble | taste | taste | writing W6 | verified |
| R1-5 | extra panel after a chapter's conclusion card breaks the standard of the video | beat after a card | form.back | rhythm | structural | test: no beat after a card; bible B13 | open: body.name, words.claim, inventory still break it |
| R1-6 | brain should show constant background neural activity | picture begs the question the line answers | body.brain | consistency | checklist | roles/animation-supervisor.md: picture contradicts or begs the line; bible B17 | verified |
| R1-7 | saw/learned/wanted shouldn't sit on one neuron | picture claims more than the line | body.trace | precision | checklist | roles/animation-supervisor.md; bible B18 | verified |
| R1-8 | arms render behind eyes/mouth | draw order in the shared bean | all beans | framing | structural | kit/bean.ts draws arms over the face | verified |
| R1-9 | use the spirit instead of the ghost | one character per concept | body.nogap | consistency | document | bible B16; visual-vocabulary `visitor` | verified |
| R1-10 | "nothing it is like" contradicts the zombie reporting experience | stipulation contradicted by a later line | zombie.diff | consistency | document + checklist | bible B4; writing W4 | verified |
| R1-11 | "Let's try a thought experiment" | appeal to authority | zombie.intro | taste | document | bible B5; writing W5 | verified |
| R1-12 | bean shading looks bad | — | all beans | taste | taste | kit/bean.ts new shading; bible entry so it does not come back | verified |

### Pairs
- R1-1: "Everything around you is made of the same few kinds of particle, pushed by the same few forces." → "...kinds of particles..."
- R1-4: "Marbles and a rocker can add too. The same play, in a different performance." → (cut)
- R1-10: "One difference. The zombie has no inner conscious experience." / "There is nothing it is like to be the zombie. No felt redness. No felt pain." → "For the sake of the experiment, give it one difference: no inner experience. No lights on inside."
- R1-11: "Philosophers built a thought experiment for exactly this." → "Let's try a thought experiment."
```

## Notes on the example

- R1-5 is the row that matters most. The note was fixed where the human
  saw it (form.back was cut), but the class was not closed. The test it
  should have produced fails on three other chapters today.
- R1-3's class came back in a new place: the checkmark later meant three
  other things. A "document" outcome without a matching
  animation-supervisor checklist line does not hold.
