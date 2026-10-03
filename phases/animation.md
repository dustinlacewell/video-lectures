# Phase: animation

First the animatic, and the human's main sign-off. Then the shared kit,
then chapter teams in parallel, each with its own critic. Last, the
director checks the whole video for consistency across chapters.

## Entry criteria

- Voice locked. `durations.json` committed. Clip-check green.
- Storyboard test green: every voiced beat has a board.
- Visual vocabulary approved by the director.

## Steps, part A: the animatic

1. **Renderer.** If the project lacks it, the
   [editor](../roles/editor.md) adds the board renderer and the
   scene-registry fallback described in
   [animatic](../documents/animatic.md).
2. **Build and measure.** The [editor](../roles/editor.md) builds the
   animatic and runs [clip-check](../tools/clip-check.md),
   [pacing-curve](../tools/pacing-curve.md), and
   [contact-sheet](../tools/contact-sheet.md).
3. **Cold viewers.** Three fresh agents (newcomer, skeptic, domain
   expert) per [cold-viewer review](../loops/cold-viewer-review.md). They
   get the contact sheet and transcript only.
4. **Record.** The [director](../roles/director.md) writes
   `production/animatic.md`: runtimes against weights, pacing flags,
   what each cold viewer believes against each chapter's job. The
   director turns mismatches into decisions for the gate.

## Gate: the animatic

This is the human's main sign-off. Fixes here are edits to data.

1. "Watch the animatic once in the player (<m:ss>). It is boards timed
   to the real voice. Send notes in any form."
2. Then the director's decisions, one per message, each with two
   choices and a recommendation. Example: "The last chapter carries
   three claims in one minute. Split it in two, or give the trivia claim
   its own card? I recommend splitting."
3. "Sign the animatic? Animation starts from it. I recommend yes."

On rejection: notes go to the [notes ledger](../documents/notes-ledger.md)
and through [notes-to-checks](../loops/notes-to-checks.md). Script
changes re-enter the voice phase for the changed clips only. Rebuild the
animatic and re-ask only what changed.

## Steps, part B: animation

5. **Shared kit first.** One kit owner (an [animator](../roles/animator.md),
   to the [art-director](../roles/art-director.md)'s spec) implements every
   vocabulary symbol in `kit/` before any chapter starts. Structural
   fixes go here: one color per badge icon, set in the kit; speech
   bubbles clamped into the safe area; face drawn over limbs. Nobody
   else edits `kit/` or `engine/` in this phase.
6. **Chapter teams in parallel.** One [animator](../roles/animator.md)
   (Opus) per chapter, each in its own worktree.
   - Owns: `scenes/<NN-chapter>*.ts`; the `cam`, `camT`, `still`, `dur`,
     `sfx`, and `cues` fields of `script/<NN-chapter>.ts`.
   - Must not touch: `say`, `card`, `speaker`, `stagger`, beat ids (a
     change breaks the voice manifest hash and clip-check fails); `kit/`,
     `engine/`, `player/`, `production/`, other chapters.
   - Needs a symbol or term that is not in the documents: stops and
     sends a proposal up.
7. **Supervise each chapter.** [Animation-supervisor](../roles/animation-supervisor.md)
   in a [maker-critic loop](../loops/maker-critic.md), at most 3 rounds.
   The producer (or a Sonnet helper) renders headless frames at each
   beat's midpoint and end (`__seek`); [QA](../roles/qa.md) runs
   [frame-sweep](../tools/frame-sweep.md). The supervisor checks each
   frame against the board's purpose, the vocabulary, and the bible.
8. **Merge.** The producer merges one worktree at a time. After each
   merge: tests, frame-sweep on the whole video. Each agent stops any
   server it started before it reports.
9. **Whole-video pass.** The director reads a contact sheet of every
   chapter, one symbol at a time across chapters, then motifs, then
   labels against terminology. Findings go to the owners, not into
   chapter files directly.

Decisions the director cannot settle go to the human, one per message.
There is no other human gate in this phase. The human's next watch is
the full draft in [post](post.md).

## Exit criteria

- No chapter falls back to boards. The registry has a scene for each.
- Every chapter passed its supervisor loop. Frame-sweep is clean.
- Director's whole-video pass has no open item.
- All worktrees merged and removed.

## Common failures

- **Symbol drift across chapters.** The checkmark meant "tested",
  "chosen", "still has it", and "clearly has it" in different chapters.
  The supervisor checks each frame against the vocabulary row; the
  director checks one symbol across all chapters.
- **Local restyling.** The animals chapter put the star in two places
  and restyled it inside a "?" bubble. A new look is a vocabulary
  proposal, not a local edit.
- **Unchecked openers.** The form chapter's new opening visual was
  never checked against anything. Every beat has a board; the board is
  the brief.
- **Picture begs the question.** A brain with no background activity
  made "those fired because others fired first" beg the question. The
  supervisor checks the picture against the line's claim.
- **Off-screen and layering.** A close-up domino and several bubbles
  were half off screen; arms drew behind the face. Frame-sweep and kit
  fixes, not eyeballing.
- **Windows worktrees.** A worktree stays locked while its agent or a
  preview server lives. Stop servers before reporting.
