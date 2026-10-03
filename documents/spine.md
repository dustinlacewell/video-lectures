# Spine

The spine is the map of the argument. It lists the claims in order and
gives each chapter one job: what the viewer believes when the chapter
ends. It also lists setups and payoffs, motifs, and each chapter's share
of the runtime.

## Why it exists

Chapter teams see one chapter. They cannot see that two chapters make the
same point. In the reference production, chapters 4–6 of the original
made one point three times, and nobody caught it, because no document
held the whole argument. The spine makes that visible on one page: two
chapters with the same job are two identical lines.

## Owner and flow

- Owner: [director](../roles/director.md). Only the director edits it.
- Readers: every role except [cold viewers](../loops/cold-viewer-review.md).
  Writers and animators read their chapter's job before they start.
- Changes flow up. A writer or animator who thinks a chapter's job must
  change sends a proposal to the director. The director decides small
  changes. A change to the thesis, the chain of claims, or a chapter's
  job goes to the human.
- Critic: [script-editor](../roles/script-editor.md) in spine mode, in a
  [maker-critic loop](../loops/maker-critic.md).

## Where it lives

`production/spine.md` in the video repo. All production documents live
under `production/` at the repo root.

## Format

```markdown
# Spine: <video title>

## Thesis
<one sentence the whole video earns>

## Viewer
Starts believing: <what a typical viewer believes before minute one>
Ends believing: <the thesis, in the viewer's words>

## Chain of claims
C1. <claim> (needs: —)
C2. <claim> (needs: C1)
...

## Chapters
### <chapter id> — <title>
- Job: when it ends, the viewer believes: <one claim, from the chain>
- Opening claim: <first spoken beat states this>
- Card: "<exact card text>"
- Carries: C<n>
- Weight: <share of runtime, %>  Measured: <seconds, after voice>
- Plants: <setups paid off later, with the chapter that pays them>
- Pays: <setups from earlier chapters this one pays>

## Setups and payoffs
| Setup | Planted | Paid | Status |
|---|---|---|---|

## Motifs
- <motif>: <what it means>, <where it recurs>

## Known defects
- <defect>: <evidence> → <proposed fix> (owner, status)
```

Rules for the format:

- A job is one claim, phrased as a belief. "Zombies" is a topic, not a
  job.
- Every claim in the chain is carried by exactly one chapter.
- Every new term or symbol a claim needs is planted before the claim.
- Weight is set before voice. After voice, write the measured seconds
  next to it. A gap of more than half the weight is a defect.
- Before voice, estimate seconds from words with the narrator rate in
  `production/status.md` ([status](status.md); the reference voices:
  1.94 spoken words per second of runtime, 826 words in 7:06). The engine's word-count
  heuristic runs about 30% long; do not plan with it.

## How it is checked

- Script-editor, spine mode (checklist in
  [director](../roles/director.md)): two chapters with the same job; a
  chapter with two or more claims; a claim that uses a term with no
  earlier setup; a setup with no payoff; a card that does not state the
  job.
- [Pacing curve](../tools/pacing-curve.md) after voice: chapter runtime
  against weight.
- [Cold viewers](../loops/cold-viewer-review.md): what they believe
  after each chapter is compared to the job line. A mismatch is a defect
  in the chapter or in the spine.

## Filled example: "What a Mind Is Made Of"

The production had no spine. This is the spine rebuilt from the final
script. Weights are what a director would have set; measured runtimes
come from the real voice clips (7:06 total).

```markdown
# Spine: What a Mind Is Made Of

## Thesis
Consciousness causes nothing you say or do, so for ethics a mind is its
cognition.

## Viewer
Starts believing: consciousness is the most important fact about a mind,
and whether a being has it decides how we treat it.
Ends believing: for the purposes of ethics, a mind is its cognition.

## Chain of claims
C1. Only physical things push matter. (needs: —)
C2. A physical thing's form fixes what it does. (needs: C1)
C3. Your body is such a thing; its machinery is called cognition. (needs: C1, C2)
C4. The words you say are selected by cognition, "I am conscious" included. (needs: C3)
C5. A twin with your physics and no inner experience says and does the
    same; so inner experience cannot be responsible for what you say or do. (needs: C4)
C6. Everything that makes you you is cognition. (needs: C3, C5)
C7. Remove experience and you remain; remove cognition and no one does. (needs: C6)
C8. The same holds for animals and AI.
C9. Whether a being is conscious is trivia for ethics.
C10. What matters is how sophisticated its cognition is and how richly
     it models itself.

## Chapters
### physics — Only physical things push
- Job: the viewer believes nothing non-physical has ever moved matter.
- Opening claim: everything is the same few particles and forces.
- Card: "If it happened, something physical made it happen."
- Carries: C1   Weight: 12%   Measured: 58 s (14%)
- Plants: particle lattice (paid: body); non-physical visitors fail (paid: body)

### form — Form is function
- Job: the viewer believes a machine does what its shape dictates.
- Opening claim: in a physical world, form and function are the same thing.
- Card: "What a thing is shaped like is what it does. Form *is* function."
- Carries: C2   Weight: 10%   Measured: 49 s (12%)
- Plants: "form doing what form does" (paid: body, inventory)

### body — Your body is this kind of machine
- Job: the viewer believes their own actions run on the same chain, and
  that chain is named cognition.
- Card: "This machinery has a name: cognition."
- Carries: C3   Weight: 12%   Measured: 45 s (11%)
- Pays: particle lattice, spirit fails

### words — This word, and not that one
- Job: the viewer believes "I am conscious" is an output of cognition.
- Card: "“I am conscious” is an output of cognition."
- Carries: C4   Weight: 12%   Measured: 55 s (13%)
- Plants: the line "Yes. Obviously. I am experiencing this right now." (paid: zombie)

### zombie — Meet your zombie twin
- Job: the viewer believes inner experience does no causal work in
  speech or action.
- Card: "Inner experience cannot be responsible for what you say or do."
- Carries: C5   Weight: 15%   Measured: 63 s (15%)
- Pays: the "I am experiencing this" line, now said by both in one voice

### inventory — What makes you you
- Job: the viewer believes every item that makes them who they are is cognition.
- Card: none (defect, see below)
- Carries: C6   Weight: 10%   Measured: 52 s (12%)

### subtract — Two subtractions
- Job: the viewer believes they are their cognition, not their consciousness.
- Card: "You are not your consciousness. You are your cognition."
- Carries: C7   Weight: 9%   Measured: 38 s (9%)

### animals — Animals, and AI
- Job: the viewer believes, for ethics, a mind is its cognition.
- Card: "For the purposes of ethics, a mind is its cognition."
- Carries: C8, C9, C10   Weight: 20%   Measured: 60 s (14%)

## Setups and payoffs
| Setup | Planted | Paid | Status |
|---|---|---|---|
| Particle lattice inside matter | physics.atoms | body.you | paid |
| Non-physical visitors fail to push | physics.ghost..thought | body.nogap (spirit) | paid |
| Form is function | form | body.list, inventory.cog | paid; zombie no longer names it |
| "Yes. Obviously. I am experiencing this right now." | words.ans2 | zombie.yes | paid |
| The star = inner experience | zombie.diff | subtract.s1a, animals.trivia | paid |
| Inventory badges | inventory | subtract, animals, end title | paid |
| Self-model | — | animals.matters | NOT PLANTED |
| Ethics | — | animals.ask | NOT PLANTED |
| The word "mind" | title only | animals.claim | planted by title only |

## Motifs
- The chain: one push causes the next (dominoes, nerve, neurons). Means
  "physical cause". Recurs in physics, body, words.
- "Same": same particles, same rules, same body, same brain, same
  cognition, same response, same is true of animals, of AI. Means "no
  difference that matters". Recurs in every chapter from body on.
- One voice for you and the zombie. Means "indistinguishable from outside".
- Faculty badges orbiting a figure. Means "what a mind is made of". Title
  and end.

## Known defects
- Repetition. "The zombie keeps everything" is claimed in zombie.pain,
  in all of inventory, and again in subtract.s1b. Three chapters, one
  belief. In the original, words–inventory made one point three times.
  → Give inventory a job the others do not have (C6 about YOU, with no
  zombie), and let subtract do the zombie half once. (director, open)
- Compression. animals carries three claims (C8, C9, C10) in 60 s, less
  than zombie spends on one. C9 is the thesis's ethical half and gets two
  lines. → Split into "animals and AI" and "trivia", or raise the weight
  and give C9 its own card. (director → human)
- Unannounced term. "how richly it models itself" (animals.matters)
  arrives with no setup. The self icon already appears as a reason chip
  in words.ask2 and is never named. → Name it there: "your model of
  yourself". (director, open)
- Unannounced frame. Ethics appears first in animals.ask. The viewer has
  no reason before minute six to think the video is about how we treat
  beings. → Plant it in the first minute or in the title subtitle. (human)
- Missing card. inventory ends on a spoken beat, against "every chapter
  ends on its card" (bible B13). Open defect in the bible. (human)
```

The defects above are the payoff of the format. Each one is a line
that reads wrong next to its neighbours: two job lines that say the same
thing, a chapter with three entries under "Carries", a "Pays" with no
matching "Plants".
