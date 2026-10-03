# Bible

The bible is the list of settled decisions. Each entry has the decision,
the reason, and who decided it. Nothing in it is reopened without the
human.

Real-studio counterpart: the show bible, plus the decision log a
showrunner keeps so the room does not re-argue last season.

## Why it exists

In the reference production the producer relitigated settled points
twice. First it raised an objection ("the zombie loses the part that
hurts") that the human had already resolved in an earlier thread. Then it
judged the current file against an old snippet of that thread and claimed
the file "didn't match the agreed order". The file was the newer version.
There was no record of what was settled, so the agent could not know.

## Owner and flow

- Owner: [director](../roles/director.md). The director writes entries.
- Approver: the human. An entry goes in only when the human said it, or
  approved it at a gate.
- Readers: every role. The producer pastes the relevant entries into
  every brief, under "decisions already made".
- To challenge an entry, an agent writes one line to the producer: the
  entry id, and the new evidence. The producer asks the human one
  question. Agents never act against an entry while a challenge is open.
- Before the producer or director raises any objection to the argument,
  it searches the bible first. If the point is there, it is not raised.
- When sources disagree, the newest version the human made wins, unless
  the human says otherwise.

## Where it lives

`production/bible.md` in the video repo.

## Format

```markdown
# Bible: <video title>

## <area: Argument | Voice | Structure | Visuals | Pipeline>

### B<n>. <the decision, one line>
- Wording: "<exact words, when the words are the decision>"
- Reason: <why, one or two sentences>
- Source: <human, which session or gate> | <director proposal, approved at gate>
- Applies to: <chapters, beat ids, roles, files>
- Rejected: <alternatives already considered>

## Locks
- Script locked: <commit>, <date>
- Cast locked: <ref clip hashes>
- Animatic signed: <commit>, see production/animatic.md

## Open
- <entry id or new question>: <what the human must rule on>
```

Ids are stable. A replaced entry is marked `Superseded by B<m>`; it is
not deleted, so the rejected path stays on record.

## How it is checked

- [Script-editor](../roles/script-editor.md): a line that contradicts
  an entry. Evidence: the line, the entry id.
- [Animation-supervisor](../roles/animation-supervisor.md): a frame
  that contradicts a visual entry. Evidence: screenshot path, entry id.
- Unit tests, where an entry is structural. Example: a test fails when a
  beat follows a chapter's card, unless the bible lists an exception.
- The producer, on itself: any objection it is about to raise is
  searched in the bible first.

## Filled example: "What a Mind Is Made Of"

```markdown
# Bible: What a Mind Is Made Of

## Argument

### B1. Thesis: consciousness is epiphenomenal, and not close to the most interesting thing about minded objects.
- Reason: this is the human's argument. The video exists to make it.
- Source: human, start of production session.
- Applies to: all.
- Rejected: softer forms ("may matter less than we think").

### B2. "Trivia" stays.
- Wording: "Whether a being is conscious is tantamount to trivia. It has no moral or ethical import."
- Reason: the human chose the strong word on purpose.
- Source: human, with the thesis ("trivia stays"); wording from notes round 1.
- Applies to: animals.trivia, the TRIVIA stamp.
- Rejected: "It is trivia." (too bare); any hedge.

### B3. The zombie has pain. The ouch, the anguish, the recoil are cognitive.
- Reason: the zombie has all your cognition, so it has every cognitive part of pain.
- Source: human, earlier thread. Re-raised by the producer in error.
- Applies to: zombie.toe, zombie.pain.
- Rejected: "the zombie loses the part that hurts".

### B4. The zombie's difference is a stipulation of the experiment.
- Wording: "For the sake of the experiment, give it one difference: no inner experience. No lights on inside."
- Reason: "nothing it is like" and "no felt pain" contradict the zombie's
  own report a few beats later.
- Source: human, notes round 1.
- Applies to: zombie.diff; any later mention of what the zombie lacks.

### B5. The thought experiment is ours, not the philosophers'.
- Wording: "Let's try a thought experiment."
- Reason: invite the viewer in; no appeal to authority.
- Source: human, notes round 1.
- Rejected: "Philosophers built a thought experiment for exactly this."

### B6. Animals clearly model themselves. Only the AI is uncertain.
- Reason: a dog knows its body, a crow grooms, an octopus never tangles itself.
- Source: human, notes round 1.
- Applies to: animals.matters self-model icons.

### B7. Final card.
- Wording: "For the purposes of ethics, a mind is its cognition."
- Source: human, notes round 1.
- Rejected: "A mind is its cognition." (claims more than the argument shows)

## Voice

### B8. Narrator: posh British woman, mid-30s, dry and wry.
- Source: human picked from voice-design samples.

### B9. Characters have their own cartoon voices. The narrator never voices a character.
- Source: human. The bean voice is "chipper".

### B10. You and the zombie share one voice.
- Reason: the argument made audible. The zombie is you, minus nothing you can hear.
- Source: director proposal, approved by human.
- Applies to: script/cast.ts (zombie = you by reference).

### B11. When several speakers answer together, each gets its own clip, slightly offset.
- Reason: one clip of two voices sounds fake.
- Source: human. Default stagger 0.15 s; zombie.yes uses 0.25 s.

### B12. Every line is cloned from one frozen reference clip per speaker.
- Reason: voice design from a text description rerolls the voice on every
  call. The human heard each line sound slightly different.
- Source: human note; structural fix approved.

## Structure

### B13. Every chapter ends on its conclusion card. Nothing follows the card.
- Reason: human: an extra panel after a card "breaks the standard of the video".
- Source: human, notes round 1 (form.back after form.claim, now cut).

### B14. Cards are narrated.
- Reason: silent cards felt like dead air in a narrated video.
- Source: human.

### B15. The form chapter opens with its thesis.
- Wording: "In a physical world, form and function are the same thing."
- Source: human, notes round 1.

## Visuals

### B16. The spirit, not the ghost, tries to reach into the brain.
- Source: human, notes round 1.

### B17. The brain always shows background activity.
- Reason: without it, "those fired because others fired first" begs the question.
- Source: human, notes round 1.

### B18. Saw, learned, wanted: one neuron each.
- Source: human, notes round 1.

### B19. A "Thought experiment" tag stays on screen from zombie.intro to the end of subtract.
- Source: human, notes round 1.

### B20. The consciousness star shows above the person in animals.
- Source: human, notes round 1.

## Pipeline

### B21. Deliver an interactive web page and an MP4.
- Source: human.

### B22. TTS: Breeze TTS 2.
- Reason: top open-weights model on the Artificial Analysis arena at the time.
- Source: human ("highest benchmarked open model").
- Note: non-commercial license. Fine while the channel is unmonetized.
  Monetizing reopens this entry.

## Locks
- Script locked: (not recorded in the production)
- Cast locked: voice/refs/narrator.wav, you.wav, friend.wav, aibot.wav

## Open
- B13 defect: body.list follows the card body.name. Pending the human's decision.
- B13 defect: words.cause follows the card words.claim. Pending the human's decision.
- B13 defect: inventory has no card. Pending the human's decision.
```

## Notes on the example

- B3 and B5 exist because of real errors: one relitigation, one human
  rewrite. Most entries come from the notes round. A bible started in
  development would have held B1–B3 before any work began.
- The "Open" section is where structural checks land when they find
  live violations. The B13 test, run on the final script, finds three.
