# Notes to checks

Every human note is a defect that got past the team. This loop turns each
note into a fix and, when a machine could have caught it, into a check so
the same kind of defect does not reach the human again.

## When it runs

After every human review: the table read, the animatic gate, any draft
the human watches, the final cut. Cold-viewer findings go through it too.

## Step 1. Split the note into atoms

One note often holds several defects. Split until each atom names one
thing in one place. "Several bubbles half off screen" is one atom per
bubble, plus one atom for the pattern.

## Step 2. Classify each atom

| Class | The defect | Example from the reference production |
|---|---|---|
| precision | A claim, word, or grammar is looser or stronger than meant | "a physical cause" → "physical causes" |
| consistency | Two parts of the video disagree | the zombie has "nothing it is like" yet reports experience |
| clarity | A viewer cannot tell what a picture or symbol means | three green checkmarks while "searching for other forces" |
| framing | Something is off screen, clipped, or drawn in the wrong layer | close-up domino half off screen |
| rhythm | Structure or timing breaks the video's pattern | an extra panel after a chapter's conclusion card |
| taste | The human prefers another choice; nothing is wrong by rule | "same play, different performance" cut |

If an atom fits two classes, pick the one whose fix is cheapest to make
permanent. Consistency beats clarity; framing beats taste.

## Step 3. Pick the outcome

Ask these in order. Stop at the first yes.

1. **Structural fix.** Can a change make this defect impossible? Do that.
   Examples: clone every line from one frozen reference clip (voice drift
   cannot happen); clamp speech bubbles into the safe area in the shared
   kit (a bubble cannot be placed off screen); a unit test that fails when
   a chapter has a beat after its card.
2. **Tool.** Can a measurement catch it every time? Add it to a tool in
   `tools/` or to the unit tests, and to [qa](../roles/qa.md)'s run list.
   Examples: off-screen text sweep every 0.1 s
   ([frame-sweep](../tools/frame-sweep.md)); clip vs beat length
   ([clip-check](../tools/clip-check.md)).
3. **Checklist item.** Can a critic catch it by looking or reading? Add
   one line to that critic's project checklist,
   `production/checks/<role>.md` in the video repo. Do not edit the
   skill's `roles/*.md` (see Step 6). Write the line as an observable
   failure with the evidence it needs. Pick the critic by sense: text →
   [script-editor](../roles/script-editor.md); frames →
   [animation-supervisor](../roles/animation-supervisor.md); a
   measurement → [qa](../roles/qa.md). A
   [cold viewer](cold-viewer-review.md) never gets a project checklist:
   it would stop being cold.
4. **Document entry.** Is it a decision, not a defect? Add it to the
   [bible](../documents/bible.md), the
   [terminology table](../documents/style-guide/terminology.md), or the
   [visual vocabulary](../documents/style-guide/visual-vocabulary.md), so
   no agent reopens it.
5. **Taste only.** Fix it. Keep the (draft, fix) pair for style learning
   (Step 5). No check.

Most atoms get a fix plus one of 1–4. A taste atom that recurs becomes a
style-guide rule and then a script-editor item in the project checks.

## Step 4. Record it

Add one row per atom to the [notes ledger](../documents/notes-ledger.md):
the note as the human said it, the atom, beat id and time, class, outcome,
the check or document entry it produced (by path), and status. The
ledger is how the producer proves a note became a check.

Changes to a tool or a shared document flow through the owner of that
file. The producer briefs the owner; it does not edit the file itself.

The producer owns `production/checks/<role>.md`. It writes each new line
there and pastes the whole file into every brief for that role, under
"project checks".

## Step 5. Style learning from (draft, fix) pairs

Each text note where the human rewrote a line gives a pair: the draft
line and the human's line. Keep both, verbatim, in the ledger.

When two or more pairs show the same move, the
[director](../roles/director.md) writes one rule into
[writing](../documents/style-guide/writing.md) with the pairs as its
examples. One pair is enough when the human states the rule outright.
Then `production/checks/script-editor.md` gets a line that detects a
breach of it.

Pairs from the reference production, verbatim from the original page
and the final script, and the [writing](../documents/style-guide/writing.md)
rules they support:

| Draft | Human's fix | Rule |
|---|---|---|
| "Philosophers built a thought experiment for exactly this." | "Let's try a thought experiment." | W5. Do it with the viewer. Do not cite authority. |
| "...your report of it has a physical cause." | "...your report of it has physical causes." | W2. Get number and agreement exact in every claim. |
| "One difference. The zombie has no inner conscious experience." / "There is nothing it is like to be the zombie. No felt redness. No felt pain." | "For the sake of the experiment, give it one difference: no inner experience. No lights on inside." | W4. Inside a thought experiment, stipulate. |
| "People ask whether it is conscious, as if the answer would settle how to treat it." | "People ask whether they are conscious, as if the answer settles how we ought to treat them." | W9. Attribute a view together with the consequence it claims. |
| "Marbles and a rocker can add too. The same play, in a different performance." | (cut) | W6. Cut a metaphor that restates a claim. |
| "...Form is function." | "...Form *is* function." | W11. Mark the word the voice must stress. |

## Step 6. Promote a generic check into the skill

The skill's `roles/*.md` checklists serve every production. A
project's checks stay in its own repo. Most are about this video only
("a hypothetical beat without the Thought experiment tag").

The producer, and only the producer, promotes a line into a role file.
All three must hold:

- The line names no symbol, term, beat or character of one video.
- A second production hit the same failure. The producer finds the
  line, or its twin, in an earlier production's
  `production/checks/<role>.md`.
- The producer writes it in the role file's checklist format.

Then it deletes the line from the current project's checks file, since
the role file now carries it.

## Worked examples from the reference production

In the reference production every checklist row below would have gone
to `production/checks/<role>.md`. None had yet hit a second production.

| Note (atom) | Class | Outcome |
|---|---|---|
| Arms render behind eyes and mouth | framing | Structural: the bean draws its face last, in the kit. Checklist (animation-supervisor): limb or prop drawn over or under the wrong body part. |
| Close-up domino half off screen | framing | Checklist (animation-supervisor): any prop crossing the frame edge at a beat midpoint or end. The [frame-sweep](../tools/frame-sweep.md) sees text and images only, not props drawn as paths. |
| Several speech bubbles half off screen | framing | Structural: bubble placement clamps into the safe area in shared kit. Tool: frame sweep covers bubbles. |
| Three green checkmarks during "searching for other forces" unclear | clarity | Document: visual-vocabulary entry for the checkmark, one meaning. Checklist (animation-supervisor): a symbol shown with a meaning not in the vocabulary. Later the checkmark meant "tested" in ch1 and "has it" in ch6 and ch8; the same entry would have caught that. |
| Brain needs constant background activity, or "fired because others fired first" begs the question | consistency | Checklist (animation-supervisor): the picture shows a causal story the line denies or does not support. |
| Saw, learned, wanted should not sit on one neuron | precision | Checklist (animation-supervisor): a picture claims more than the line (one neuron shown as one concept). |
| Zombie has "nothing it is like" yet reports experience | consistency | Document: bible entry with the stipulation's exact wording. Checklist (script-editor): a stipulation contradicted by a later line. |
| "particle" → "particles" | precision | Fix. Checklist (script-editor): grammatical number and agreement on every noun in a claim. |
| "a physical cause" → "physical causes" | precision | Fix. Style pair (W2). Checklist (script-editor): grammatical number in a claim. |
| Extra panel after a chapter's conclusion card | rhythm | Structural: a unit test that fails when a beat follows a chapter's card, unless the bible lists an exception. Checklist (script-editor): a chapter continues past its card. |
| Open the form chapter with its thesis | rhythm | Document: the spine gives each chapter an opening claim. Checklist (script-editor): a chapter's first spoken beat does not state its spine opening claim. |
| Use the spirit instead of the ghost | consistency | Document: visual-vocabulary entry names one character per concept. |
| Persistent "Thought experiment" tag | clarity | Document: visual-vocabulary entry: the tag stays on screen for the whole hypothetical. Checklist (animation-supervisor): a hypothetical beat without the tag. |
| Self-model icons: animals clearly self-model, only AI is uncertain | precision | Checklist (animation-supervisor): an icon encodes a fact the narration or bible does not support. Domain-expert cold viewer covers this kind of error. |
| Bean shading looks bad | taste | Fix. Bible entry for the shading choice so no animator brings it back. |
| Each line sounds slightly different | consistency | Structural: freeze one reference clip per speaker and clone every line from it. No check needed. |
| Lines cut off at the end | rhythm | Structural: the player lets each clip end on its own instead of stopping it on the timeline clock (the real cause was the player, 20–80 ms early). Tool: render-time verify rejects a clip that ends mid-sound. |
| "tantamount to trivia" | taste | Fix. Bible entry: "trivia" stays. |

The runtime change when real voice replaced estimates
([voice phase](../phases/voice.md)) was not a human note, but it ran
the same loop: rhythm; structural fix (voice before animation); tool
([pacing-curve](../tools/pacing-curve.md) at the animatic).
