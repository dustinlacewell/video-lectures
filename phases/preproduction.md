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
   1–4. Each item has a verify command; the commands live in
   [contract §11](../engine/contract.md#11-reference-repo-gaps).

   | Item | Needed by | Verify |
   |---|---|---|
   | Board renderer and scene-registry fallback | the animatic | `{VERIFY: contract §11, board renderer}` |
   | Storyboard test (and `production` in tsconfig `include`) | step 5 | `{VERIFY: contract §11, storyboard test}` |
   | Card-last test: no beat after a chapter's card | step 3 | `{VERIFY: contract §11, card test}` |
   | `__script()` global | the tools | `{VERIFY: contract §11, __script}` |
   | Deterministic audio: seeded noise, music a function of `T` | export | `{VERIFY: contract §11, audio}` |

1. **Seed the style guide.** The [director](../roles/director.md) writes
   [writing](../documents/style-guide/writing.md) (voice profile, rules
   from the bible and any prior human rewrites) and starts
   [terminology](../documents/style-guide/terminology.md) with the
   spine's key terms. The [art-director](../roles/art-director.md)
   drafts the [visual vocabulary](../documents/style-guide/visual-vocabulary.md)
   from the spine's motifs. The director approves each entry. Lean: the
   director does the art-director's part too, in the same run.
2. **Write.** [Writer](../roles/writer.md) agents draft
   `script/<NN-chapter>.ts`: beats with stable ids, `say`, `card`,
   `speaker`. No camera or sound cues yet. Full: chapters may run in
   parallel; each writer owns one chapter file. Lean: one writer writes
   the whole script. The producer owns `script/index.ts`; the engine
   owner owns `script/types.ts`. [Casting](../roles/casting.md) owns
   `script/cast.ts`.

   **Budget words, not seconds.** Each chapter's word budget is its
   target seconds × the narrator's measured rate. The rate is in
   `production/status.md`, from a previous production's
   [pacing-curve](../tools/pacing-curve.md) run. The reference narrator
   runs about 2.0 words per second, pads included. Never plan with the
   engine's word-count heuristic: on the reference it overestimated
   runtime by about 30%.
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
   per speaker. After the human picks, casting freezes one reference clip
   per speaker with a verified transcript, and writes the cast file.
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
