# Phase: post

Assemble the sound, sweep the whole video, run cold viewers on the real
cut, take the human's notes, and turn every note into a fix and a check.

## Entry criteria

- Animation phase exit criteria met: every chapter animated, merged, and
  clean under frame-sweep.

## Steps

1. **Assemble.** The [sound engineer](../roles/sound-engineer.md) sets
   music and its ducking under voice, and sound-effect levels. The
   [editor](../roles/editor.md) checks transitions between chapters and
   card timing (a card stays at least its reading time); a hold change
   goes to the chapter's animator, who owns `dur`.
2. **Sweep.** [QA](../roles/qa.md) runs the full set:
   [frame-sweep](../tools/frame-sweep.md) every 0.1 s,
   [clip-check](../tools/clip-check.md), unit tests, and a determinism
   check (the same `t` rendered twice gives the same pixels).
3. **Pacing.** The editor runs [pacing-curve](../tools/pacing-curve.md)
   on the full cut. Now "seconds since last visual change" counts. The
   [director](../roles/director.md) flags long static stretches and beats
   over the words-per-second ceiling.
4. **Cold viewers.** Three new agents per
   [cold-viewer review](../loops/cold-viewer-review.md), on the final
   contact sheet and transcript. The comparison with the spine and the
   ledger rows follow that loop. Lean: only if the topic is contested;
   otherwise skip this step.
5. **Human watch.** The human watches the full draft in the player.
   The producer copies every note into the
   [notes ledger](../documents/notes-ledger.md) verbatim, before doing
   anything else. A decision in a note goes into the bible verbatim too.
6. **Notes to checks.** The director splits and classifies the notes
   per [notes-to-checks](../loops/notes-to-checks.md). Each atom goes to
   the owner of the file it touches. One-word text fixes are batched
   into one writer and script-editor pass; changed lines re-render
   through the [voice phase](voice.md) steps for those clips only.
7. **Re-verify.** QA reruns the sweep and closes each ledger row only
   when the fix and its check both exist.

Lean: the producer runs the step 2 and step 7 tools itself and reads
only the summary lines.

Notes round task mode runs steps 5–7 alone: the producer triages the
notes, the owning makers fix, their critics check, then QA. A note that
arrives while fixes are mid-round follows
[change-orders](../loops/change-orders.md).

## Gate: the final cut

Every message: one decision, two choices, a recommendation. Keep each
tiny.

1. "Watch the full draft once (<m:ss>). Send notes in any form."
2. After fixes: "All <n> notes are fixed and checked. Watch only the
   changed moments (<list of times>), or the whole thing? I recommend
   the changed moments."
3. Each taste dispute the team could not settle. One per message.
4. "Final cut approved? Export comes next. I recommend yes."

On rejection: a new ledger round. Repeat steps 5–7.

## Exit criteria

- Every ledger row is verified, or the human chose to leave it open.
- QA sweep is green.
- The human approved the final cut. Bible "Locks": final cut at <commit>.

## Common failures

- **Audio defects reach the human.** Agents cannot hear. In the
  reference production two audio defects (voice drift, cut-off lines)
  were found by the human. Speech-to-text checks and clip-check catch
  the classes a machine can catch; the human's listen catches the rest.
- **Dense notes get lost.** The human's first notes round had about 25
  items in one message. Record them verbatim first, split second.
- **Fixing the instance, not the class.** The "panel after a card" note
  was fixed in the form chapter only. The test it should have produced
  would still fail on three chapters. A ledger row is not closed until
  its check exists.
- **Dead air.** Silent cards felt empty in a narrated video. Cards are
  narrated (bible B14); check card timing in assembly.
