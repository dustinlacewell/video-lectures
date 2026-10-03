# Phase: post

Assemble the sound, sweep the whole video, run cold viewers when they
are due, take the human's notes, and turn every note into a fix and a
check.

## Entry criteria

- Animation exit criteria met: every chapter animated, merged and clean
  under frame-sweep.

## Steps, the final cut

1. **Assemble** (full). The [sound engineer](../roles/sound-engineer.md)
   sets music, its ducking under voice, and sound-effect levels. The
   [editor](../roles/editor.md) checks transitions and card timing (a
   card stays at least its reading time). A hold change goes to the
   chapter's animator, who owns `dur`.
2. **Sweep.** [frame-sweep](../tools/frame-sweep.md) every 0.1 s,
   [clip-check](../tools/clip-check.md), `wm test {SLUG}`, and a determinism
   check ([contact-sheet](../tools/contact-sheet.md) `--twice`). Lean:
   the producer runs them. Full: [QA](../roles/qa.md).
3. **Pacing.** Run [pacing-curve](../tools/pacing-curve.md) on the full
   cut. "Seconds since last visual change" now counts. Long static
   stretches and beats over the words-per-second ceiling become notes.
   Lean: the producer. Full: the editor, and the
   [director](../roles/director.md) flags.
4. **Cold viewers.** New agents per
   [cold-viewer review](../loops/cold-viewer-review.md) on the final
   contact sheet and transcript. Full: always, three personas. Lean:
   three, only if the topic is contested ([sizing](sizing.md)).
5. **Human watch.** The human watches the full draft in the player. The
   producer copies every note into the
   [notes ledger](../documents/notes-ledger.md) verbatim, before anything
   else. A decision in a note goes into the bible verbatim too.

## The notes round

Steps 6–9. Both tracks. The notes-round task mode starts at step 5 with
notes already in hand ([sizing](sizing.md#notes-round)).

6. **Split and verify.** Split each note into atoms per
   [notes-to-checks](../loops/notes-to-checks.md). Then the producer
   verifies each atom on the actual frame or clip before routing it:
   render the frame at its time with contact-sheet `--times`, or read
   the clip's transcript line. Rewrite the cause if it is wrong. A
   tool's guessed cause can be wrong: on the reference, "Thismachinery"
   looked like a text-wrap bug. The settled card was spaced right; the
   words overlapped only while the card popped in. Routed as written, it
   would have gone to the wrong file.
7. **Triage.**
   - Cold-viewer findings are compared with the spine. If the script
     already answers the objection, the finding is "answered but did not
     land". Its fix makes the answer land (timing, emphasis, picture); it
     adds no new argument.
   - A finding that attacks a bible entry goes to the human as a
     question. It is never fixed and never silently dropped. Status:
     `human-decision`.
   - A finding the bible already settles, which the video states, closes
     as `settled` with the entry id. List these in one line at the gate.
   - Mark every file a pending question can change. Fixes that touch
     those files wait. Status: `held`.
8. **Fix.** Each atom goes to the owner of its file. The owner fixes;
   its critic checks. Text fixes wait for the round's decisions, then go
   in one writer pass and one script-editor pass, so changed clips
   re-render once ([voice](voice.md) steps 1–3).
9. **Re-verify and close.** Rerun the step 2 sweep (lean: the producer;
   full: QA). A ledger row closes only when the fix and its check both
   exist.

A note that arrives while fixes are mid-round follows
[change-orders](../loops/change-orders.md).

## Gate: the final cut

One decision per message: two choices and a recommendation.

1. "Watch the full draft once (<m:ss>). Send notes in any form."
   When the notes came from agents and the human has not watched: a
   two-line summary instead (thesis match, the top three hot spots).
2. Each `human-decision` question, in order of impact.
3. After fixes: "All <n> notes are fixed and checked. Watch only the
   changed moments (<times>), or the whole thing? I recommend the
   changed moments."
4. Each taste dispute the team could not settle.
5. "Final cut approved? Export comes next. I recommend yes."

On rejection: a new notes round, steps 5–9.

## Exit criteria

- Every ledger row is verified, `settled`, or left open by the human.
- The sweep is green.
- The human approved the final cut. Bible "Locks": final cut at
  <commit>.

## Common failures

- **Audio defects reach the human.** Agents cannot hear. Voice drift and
  cut-off lines were found by the human. Speech-to-text and clip-check
  catch what a machine can; the human's listen catches the rest.
- **Dense notes get lost.** The first notes round had about 25 items in
  one message. Record verbatim first, split second.
- **Fixing the instance, not the class.** The "panel after a card" note
  was fixed in one chapter only; its test would still fail on three. A
  row is not closed until its check exists.
- **Routing a guess.** A cause written by a tool or a viewer is a
  guess until the frame confirms it (step 6).
