# Phase: preproduction

Build the style guide, write the script as data, check it, board every
beat, and lock the cast. At the end, everything needed to record voice
and draw the animatic exists. The script locks after the table read in
the [voice phase](voice.md) (lean: at the
[animatic gate](animation.md)).

## Entry criteria

- Development gate passed: `production/spine.md` and
  `production/bible.md` approved.
- The repo exists (made in [development](development.md)).

## Steps

0. **Engine readiness.** The [engine owner](../roles/engine-owner.md)
   (Opus) builds what the reference repo lacks, in parallel with steps
   1–4. Each item has a verify command in its row of
   [contract §11](../engine/contract.md#11-reference-repo-gaps).

   | Item | Needed by | Contract §11 row |
   |---|---|---|
   | Board renderer and scene-registry fallback | the animatic | "No board renderer" |
   | Storyboard test `test/storyboard.test.ts` (and `production` in tsconfig `include`) | step 5 | "No storyboard test", "No `production/` folder" |
   | Card-last test `test/card-last.test.ts`: no beat after a chapter's card | step 3 | "No test that fails on a beat after a card" |
   | `__script()` global | the tools | "No `__script()` global" |
   | Deterministic audio: seeded noise, music a function of `T` | export | "Music and sound effects are not a pure function of `T`" |

1. **Seed the style guide.** The [director](../roles/director.md) writes
   [writing](../documents/style-guide/writing.md) (voice profile, rules
   from the bible and any prior human rewrites) and starts
   [terminology](../documents/style-guide/terminology.md) with the
   spine's key terms. The [art-director](../roles/art-director.md)
   drafts the [visual vocabulary](../documents/style-guide/visual-vocabulary.md)
   from the spine's motifs. The director approves each entry. Lean: the
   director does the art-director's part too, in the same run.

   In the same step, before any writer starts:
   - [Casting](../roles/casting.md) declares the speaker ids from the
     spine's list of speaking characters: the `SpeakerId` union and one
     entry per id in `script/cast.ts`. Types only; a `ref` may point at a
     clip that does not exist yet. A writer who needs a new id requests
     it through the producer.
   - The producer records the narrator rate in `production/status.md`
     ([status](../documents/status.md)). Reference voices reused: 1.94
     spoken words per second of runtime, measured by
     [pacing-curve](../tools/pacing-curve.md) on the reference (826 words
     in 7:06). A new narrator: 2.0, replaced by the measured value after
     the first render.
2. **Write.** [Writer](../roles/writer.md) agents draft
   `script/<NN-chapter>.ts`: beats with stable ids, `say`, `card`,
   `speaker`. No camera or sound cues yet. Full: chapters may run in
   parallel; each writer owns one chapter file. Lean: one writer writes
   the whole script. The producer owns `script/index.ts`; the engine
   owner owns `script/types.ts` except `SpeakerId` and `SfxName`.
   [Casting](../roles/casting.md) owns `SpeakerId` and `script/cast.ts`.
   A writer uses only the declared speaker ids.

   **Budget words, not seconds.** Each chapter's word budget is its
   target seconds × the narrator rate in `production/status.md` (step
   1). Never plan with the engine's word-count heuristic: on the
   reference it overestimated runtime by about 30%.
3. **Edit.** [Script-editor](../roles/script-editor.md) in a
   [maker-critic loop](../loops/maker-critic.md), at most 3 rounds:
   writing rules, terminology grep, bible conflicts, card is the last
   beat. Run it once on the whole script, after all writers finish. Not
   one loop per chapter.
4. **Whole-script pass.** The director reads the full script against the
   spine: each chapter does its job; no two chapters make one point;
   each chapter's word count against its budget. Real lengths come from
   voice.
5. **Board.** The director writes each beat's `purpose`; the
   art-director (lean: the director) fills in the picture fields in
   `production/storyboard/<NN-chapter>.ts`.
   The [storyboard](../documents/storyboard.md) test must pass: every
   voiced beat has a board, every symbol id is in the vocabulary.
6. **Cast.** [Casting](../roles/casting.md) makes 2–3 candidate voices
   per declared speaker. After the human picks, casting freezes one
   reference clip per speaker with a verified transcript, and points
   each cast entry's `ref` at it.
   Every later line clones that clip. See
   [voice pipeline](../engine/voice-pipeline.md).

## Gate: script and cast

One decision per message: two choices and a recommendation. Keep each
message tiny. Lean and full use the same gate.

1. Script. "The script is ready to record. Read it now (about <n>
   minutes), or hear it at the table read? I recommend the table read:
   line changes there cost one re-render."
2. Each speaker's voice. "Narrator: play A (<path>) and B (<path>).
   Which one? I recommend A, because <reason>." One speaker per message.
3. Each visual-vocabulary conflict the director cannot settle. One per
   message.

On rejection: a rejected voice gets new candidates from a new brief that
quotes the human's words. A rejected line goes to the writer, then the
script-editor. The producer appends each answer to the bible verbatim.
A note that arrives while writers or the critic are mid-round follows
[change-orders](../loops/change-orders.md).

## Exit criteria

- Script tests pass: beat ids unique, every chapter ends on its card
  (or the bible lists the exception).
- `script/cast.ts` points every speaker at a frozen reference clip with a
  verified transcript. Bible "Locks" records the clip hashes.
- The three style-guide files exist and are approved.
- The storyboard test passes.
- Every engine-readiness item passes its verify command.

## Common failures

- **Voice drift.** In the reference production voices were made from a
  text description on every call, so each line sounded slightly
  different. The human heard it. Freeze a reference clip at cast lock;
  this makes drift impossible instead of measuring it.
- **Appeal to authority.** "Philosophers built a thought experiment" →
  "Let's try a thought experiment." Writing rule W5.
- **Contradicted stipulation.** "Nothing it is like to be the zombie",
  then the zombie reports experience. Bible B4, writing W4.
- **Narrator quoting characters.** "Someone asks: coffee or tea?" Give
  the line to the character. Writing W7.
- **Local inventions.** Chapter agents made up symbols and terms. Here,
  a new term or symbol goes up to the director before it is used.
- **Boards go stale.** If the table read splits or merges beats, the
  storyboard test fails. Fix the boards before the animatic.
