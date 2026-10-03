# Phase: preproduction

Write the script as data, board every beat, check both, and settle the
cast. At the end, everything needed to record voice and draw the
animatic exists. The script locks after the table read in the
[voice phase](voice.md) (lean: at the [animatic gate](animation.md)).

## Entry criteria

- Development gate passed: `production/spine.md` and
  `production/bible.md` approved.
- The repo exists (made in [development](development.md) step 0).

## Step 0, both tracks: engine readiness

Only when the engine has open
[contract §11](../engine/contract.md#11-reference-repo-gaps) gaps. It is
a one-time cost ([sizing](sizing.md#one-time-costs)), and this is its
only home.

The [engine owner](../roles/engine-owner.md) builds the items below. It
starts at once and runs in parallel with every other step. Its tests
pass with zero boards and no production documents: each new test proves
itself on a fixture, so nothing here waits for a board or a document.
[QA](../roles/qa.md) checks the work, on both tracks.

| Item | Needed by | Contract §11 row |
|---|---|---|
| Card-last test `test/card-last.test.ts` | the script check | "No test that fails on a beat after a card" |
| Storyboard test `test/storyboard.test.ts`, and `production` in tsconfig `include` | the board check | "No storyboard test", "`tsconfig.json` does not include `production/`" |
| Board renderer and scene-registry fallback | the animatic | "No board renderer" |
| `__script()` global | the tools | "No `__script()` global" |

Deterministic audio is part of the exporter job in
[animation](animation.md), not this step.

When readiness merges, the producer runs `wm test {SLUG}` on the current
script and boards.

## Steps, lean

1. **Cast.** Speaker ids come from the spine's list of speaking
   characters.
   - Reused voices: the producer does casting's file work per
     [new-project](../engine/new-project.md) §5. Copy the refs and
     transcripts byte for byte, check each sha256, declare the ids, copy
     the cast entries, record the hashes in the bible's Locks. No agent.
     The human signed these refs off before, so no length or
     speech-to-text check runs on the copies.
   - New voices: one [casting](../roles/casting.md) run declares the ids
     and renders 2–3 candidates per speaker. After the human picks, one
     freeze run per [voice pipeline](../engine/voice-pipeline.md).

   The producer records the narrator rate in `production/status.md`.
   Reused voices: 1.94 spoken words per second of runtime (826 words in
   7:06 on the reference). A new narrator: 2.0, replaced after the first
   render.
2. **Write.** One [writer](../roles/writer.md) run writes the whole
   script: `script/<NN-chapter>.ts`, beats with stable ids, `say`,
   `card`, `speaker`. Only declared speaker ids. Word budget per chapter:
   its target seconds × the narrator rate.
3. **Board.** One [director](../roles/director.md) run writes every
   voiced beat's board in `production/storyboard/<NN-chapter>.ts`:
   purpose and picture fields. It adds the visual-vocabulary rows and
   the Sounds rows the boards actually use, and no others. The storyboard
   test passes.
4. **Check both.** One [script-editor](../roles/script-editor.md) run,
   in its combined mode: the script checklist and the
   [board checklist](../roles/director.md#board-checklist). The director
   never reviews its own boards.
5. **Fix, one round at most.** The writer and the director fix their
   findings in parallel, one SendMessage each. The producer runs
   `wm test {SLUG}`. A finding still in dispute goes to the human at the gate.

## Steps, full

1. **Style guide, speakers, rate.** The director writes
   [writing](../documents/style-guide/writing.md) and
   [terminology](../documents/style-guide/terminology.md), adapting the
   parent's copies if there are any. The
   [art-director](../roles/art-director.md) drafts the
   [visual vocabulary](../documents/style-guide/visual-vocabulary.md)
   from the spine's motifs. The director approves each entry. Before any
   writer starts, [casting](../roles/casting.md) declares the speaker
   ids (types only; a `ref` may point at a clip not yet made), and the
   producer records the narrator rate as in lean step 1.
2. **Write.** One writer per chapter, in parallel. Each owns one chapter
   file. The producer owns `script/index.ts`; the engine owner owns
   `script/types.ts` except `SpeakerId` and `SfxName`; casting owns
   `SpeakerId` and `script/cast.ts`. Word budget as in lean step 2.
   Never plan with the engine's word-count heuristic: on the reference
   it overestimated runtime by about 30%.
3. **Edit.** Script-editor in a [maker-critic loop](../loops/maker-critic.md),
   at most 3 rounds, once on the whole script after all writers finish.
4. **Whole-script pass.** The director reads the full script against the
   spine: each chapter does its job; no two chapters make one point;
   each chapter's word count against its budget.
5. **Board.** The director writes each beat's purpose; the art-director
   fills in the picture fields. The script-editor critiques them in
   boards mode, with the board checklist. The storyboard test passes.
6. **Cast.** Casting makes 2–3 candidate voices per new speaker. After
   the human picks, casting freezes one reference clip per speaker with
   a verified transcript. Reused voices: as in lean step 1.

## Gate: script and cast

One decision per message: two choices and a recommendation.

1. Script. Lean: "The script is ready to record. Read it now (about <n>
   minutes), or hear it at the animatic? I recommend the animatic: a
   line change there costs one re-render." Full: the same, with "at the
   table read".
2. Each new speaker's voice. "Narrator: play A (<path>) and B (<path>).
   Which one? I recommend A, because <reason>." Reused voices need no
   message.
3. Each finding still in dispute, and each vocabulary conflict the
   director cannot settle. One per message.

On rejection: a rejected voice gets new candidates from a brief that
quotes the human's words. A rejected line goes to the writer. The
producer appends each answer to the bible verbatim. A note that arrives
mid-round follows [change-orders](../loops/change-orders.md).

## Exit criteria

- `wm test {SLUG}` passes: beat ids unique, every chapter ends on its card (or
  the bible lists the exception), storyboard test green.
- `script/cast.ts` points every speaker at a frozen reference clip. The
  bible's Locks records the clip hashes.
- The three style-guide files exist and are approved.
- Engine readiness, when it ran, passed QA.

## Common failures

- **Voice drift.** Voices made from a text description on every call
  sounded slightly different line to line. Freeze a reference clip at
  cast lock; drift becomes impossible.
- **Appeal to authority.** "Philosophers built a thought experiment" →
  "Let's try a thought experiment." Writing rule W5.
- **Contradicted stipulation.** "Nothing it is like to be the zombie",
  then the zombie reports experience. Bible B4, writing W4.
- **Narrator quoting characters.** "Someone asks: coffee or tea?" Give
  the line to the character. Writing W7.
- **Local inventions.** A new term or symbol goes up to the director
  before it is used.
- **Self-review.** On a dry run the director wrote the boards and was
  named their critic. The combined critic run exists to stop that.
