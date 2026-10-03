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

An excerpt. The production had no spine while it was made. This one is
rebuilt from the final script. Weights are what a director would have
set; measured seconds come from the real voice clips (7:06.2 total).
Full real version: `D:\code\ai\cognition\production\spine.md` (all
eight chapters and every known defect).

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
C8. The same holds for animals and AI. (needs: C7)
C9. Whether a being is conscious is trivia for ethics. (needs: C5, C8)
C10. What matters is how sophisticated its cognition is and how richly
     it models itself. (needs: C9)

## Chapters
### physics — Only physical things push
- Job: when it ends, the viewer believes: nothing non-physical has ever moved matter.
- Opening claim: "Everything around you is made of the same few kinds of particles, pushed by the same few forces." (physics.atoms)
- Card: "If it happened, something physical made it happen."
- Carries: C1
- Weight: 12%  Measured: 58.3 s (14%)
- Plants: particle lattice (paid: body.you); non-physical visitors fail (paid: body.nogap)
- Pays: —

### inventory — What makes you you
- Job: when it ends, the viewer believes: every item that makes them who they are is cognition.
- Opening claim: "So what makes you you? Take inventory." (inventory.you)
- Card: none (defect, see below)
- Carries: C6
- Weight: 10%  Measured: 51.9 s (12%)
- Plants: the inventory badges (paid: subtract, animals, end title)
- Pays: form is function (inventory.cog); the star (inventory)

### animals — Animals, and AI
- Job: when it ends, the viewer believes: for ethics, a mind is its cognition.
- Opening claim: "The same is true of animals." (animals.animals)
- Card: "For the purposes of ethics, a mind is its cognition."
- Carries: C8, C9, C10
- Weight: 20%  Measured: 60.1 s (14%)
- Plants: —
- Pays: the star (animals.ask, animals.trivia); the badges (animals.are, end title); self-model and ethics (both NOT PLANTED)

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
  belief. All three cold viewers in notes round 3 said so (R3-1 to R3-3).
  → Give inventory a job the others do not have (C6 about YOU, with no
  zombie), and let subtract do the zombie half once. (director → human, Q2)
- Compression. animals carries three claims (C8, C9, C10) in 60 s, less
  than zombie spends on one. C9 is the thesis's ethical half and gets two
  lines and no reason beat. All three cold viewers stopped at
  animals.trivia (R3-4 to R3-6). → Add a reason beat before
  animals.trivia, or split the chapter. (director → human, Q1)
- Unannounced term. "how richly it models itself" (animals.matters)
  arrives with no setup. The self icon already appears as a reason chip
  in words.ask2 and is never named. → Name it there: "your model of
  yourself". (director, open)
- Unannounced frame. Ethics appears first in animals.ask. The viewer has
  no reason before minute six to think the video is about how we treat
  beings. → Plant it in the first minute or in the title subtitle. (human)
- Missing card. inventory ends on a spoken beat, against "every chapter
  ends on its card" (bible B13). (human, Q2)
```

The defects above are the payoff of the format. Each one is a line
that reads wrong next to its neighbours: two job lines that say the same
thing, a chapter with three entries under "Carries", a "Pays" with no
matching "Plants".
