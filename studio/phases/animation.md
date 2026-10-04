# Phase: animation

First the animatic and the human's main sign-off. Then the exporter (if
none exists), the shared kit, and chapter teams in parallel, each with
its own critic.

## Entry criteria

- Voice rendered and clip-check green (full: voice locked).
  `durations.json` committed.
- Storyboard test green: every voiced beat has a board.
- The board renderer exists ([preproduction](preproduction.md) step 0).

## Steps, part A: the animatic

1. **Build and measure.** Build the animatic per
   [animatic](../documents/animatic.md). Run
   [clip-check](../tools/clip-check.md),
   [pacing-curve](../tools/pacing-curve.md) and
   [contact-sheet](../tools/contact-sheet.md). The cold viewers' sheet is
   captured with `?boards` and without `?purpose`: the purpose is the
   spine, and a cold viewer must not see it. Lean: the producer does
   this. Full: the [editor](../roles/editor.md).
2. **Cold viewers.** Fresh agents per
   [cold-viewer review](../loops/cold-viewer-review.md), on the contact
   sheet and transcript only. Lean: newcomer and skeptic, 2 runs. Full:
   newcomer, skeptic and domain expert.
3. **Compare with the spine.** Lean: the producer compares the reports
   with each chapter's job and writes the gate decisions. No synthesis
   agent. Full: the [director](../roles/director.md) writes
   `production/animatic.md`: runtimes against weights, pacing flags,
   what each viewer believes against each job, and the decisions.

## Gate: the animatic

The human's main sign-off. Fixes here are edits to data. One decision
per message: two choices and a recommendation.

1. "Watch the animatic once in the player (<m:ss>). It is boards timed
   to the real voice. Send notes in any form." Lean: this is also the
   table read. Add "Note any line that sounds wrong: wrong word, odd
   stress, cut off, wrong voice."
2. The decisions from step 3, one per message. Example: "The last
   chapter carries three claims in one minute. Split it in two, or give
   the trivia claim its own card? I recommend splitting."
3. "Sign the animatic? Animation starts from it. I recommend yes." Lean:
   "Sign the animatic and lock the script and voice?"

On rejection: notes go to the [notes ledger](../documents/notes-ledger.md)
and through [notes-to-checks](../loops/notes-to-checks.md). Script
changes go to the writer (full: then the script-editor), then voice
steps 1–3 for the changed clips only. Rebuild the animatic and re-ask
only what changed.

## Steps, part B: animation

4. **Exporter** (one-time, only if none exists). The
   [engine owner](../roles/engine-owner.md) builds it per
   [export](../engine/export.md), including its §3 engine change for
   deterministic audio. It starts right after the gate, in its own
   worktree, in parallel with steps 5–8. [QA](../roles/qa.md) runs
   export.md's §6 verification on the animatic. Delivery cannot start
   until it passes.
5. **Shared kit.** One kit owner (an [animator](../roles/animator.md))
   implements every vocabulary symbol the kit lacks, in the video's
   `kit/` or in `@studio/library` if it is generic enough to share, to
   the [art-director](../roles/art-director.md)'s spec (lean: the
   director's), before any chapter starts. Structural fixes go here:
   one color per badge icon, speech bubbles clamped to the safe area,
   face drawn over limbs. Lean: only when the vocabulary added symbols
   the kit lacks. Nobody else edits `kit/`, `@studio/library` or
   `@studio/engine` in this phase.
6. **Chapter teams in parallel.** Each animator (Opus) works in its own
   worktree. Lean: 2–3 chapter groups. Full: one chapter each.
   - Owns: `scenes/<NN-chapter>*.ts`; the `cam`, `camT`, `still`, `dur`,
     `sfx` and `cues` fields of its chapters' script files.
   - Must not touch: `say`, `card`, `speaker`, `stagger`, beat ids (a
     change breaks the voice manifest hash); `kit/`, `@studio/engine`,
     `@studio/library`, `production/`, other chapters.
   - Needs a symbol or term not in the documents: stops and sends a
     proposal up.
7. **Supervise.** The [animation-supervisor](../roles/animation-supervisor.md)
   checks each beat's frames against the board's purpose, the
   vocabulary and the bible.
   - Lean: one supervisor pass per group, then at most one fix round by
     the animator. The producer runs [frame-sweep](../tools/frame-sweep.md)
     and clip-check. A finding the fix did not close becomes an open
     ledger row for post.
   - Full: a [maker-critic loop](../loops/maker-critic.md), at most 3
     rounds; QA runs frame-sweep each round.
8. **Merge.** The producer merges one worktree at a time. After each
   merge: `wm test {SLUG}`, frame-sweep on the whole video. Each agent stops any
   server it started before it reports.
9. **Whole-video pass** (full). The director reads a contact sheet of
   every chapter: one symbol at a time across chapters, then motifs,
   then labels against terminology. Findings go to the owners.

Decisions the director cannot settle go to the human, one per message.
A human note that arrives while chapter loops run follows
[change-orders](../loops/change-orders.md). The human's next watch is
the full draft in [post](post.md).

The polish task mode runs steps 7–8 on the named chapters
([sizing](sizing.md#polish)).

## Exit criteria

- No chapter falls back to boards.
- Every chapter passed its supervisor step. Frame-sweep is clean.
- Full: the director's whole-video pass has no open item.
- All worktrees merged and removed.
- The exporter, when it was built here, passed export.md §6 on the
  animatic.

## Common failures

- **Symbol drift.** The checkmark meant "tested", "chosen", "still has
  it" and "clearly has it" in different chapters. The supervisor checks
  each frame against the vocabulary row.
- **Local restyling.** The animals chapter restyled the star inside a
  "?" bubble. A new look is a vocabulary proposal, not a local edit.
- **Picture begs the question.** A brain with no background activity
  made "those fired because others fired first" beg the question. The
  supervisor checks the picture against the line's claim.
- **Off-screen and layering.** Bubbles half off screen; arms behind the
  face. Frame-sweep and kit fixes, not eyeballing.
- **Export left to the end.** On the reference the exporter was still
  not built when the video was otherwise done. Step 4 builds it here.
- **Windows worktrees.** A worktree stays locked while its agent or a
  preview server lives. Stop servers before reporting.
