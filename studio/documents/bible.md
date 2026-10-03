# Bible

The bible is the list of settled decisions. Each entry has the decision,
the reason, and who decided it. Nothing in it is reopened without the
human.

## Why it exists

In the reference production the producer relitigated settled points
twice. First it raised an objection ("the zombie loses the part that
hurts") that the human had already resolved in an earlier thread. Then it
judged the current file against an old snippet of that thread and claimed
the file "didn't match the agreed order". The file was the newer version.
There was no record of what was settled, so the agent could not know.

This is the one place that story is told. Other files link here.

## Owner and flow

- Recorder: the producer. When the human states a decision, the producer
  appends it under "Incoming" at once, in the human's words, with
  `Source: human`. It does this before it acts on the decision. It does
  not rephrase, merge or file it.
- Structure: [director](../roles/director.md). Later, the director
  files each incoming entry into its area, adds reason, scope and
  rejected paths, and writes its own proposals. The human's words stay
  in "Wording", verbatim. The entry keeps its id.
- Approver: the human. An entry goes in only when the human said it, or
  approved it at a gate.
- Readers: every role except [cold viewers](../loops/cold-viewer-review.md).
  The producer pastes the relevant entries into every other brief,
  under "decisions already made".
- To challenge an entry, an agent writes one line to the producer: the
  entry id, and the new evidence. The producer asks the human one
  question. Agents never act against an entry while a challenge is open.
- Before the producer or director raises its own objection to the
  argument, it searches the bible first. If the point is there, it is
  not raised.
- A finding from outside the team (a cold viewer, a human reviewer)
  that attacks an entry is new evidence. It goes to the human as a
  question. The team never fixes against the entry and never drops the
  finding ([notes to checks](../loops/notes-to-checks.md), step 4).
- When sources disagree, the newest version the human made wins, unless
  the human says otherwise.

## Where it lives

`production/bible.md` in the video repo.

## Format

```markdown
# Bible: <video title>

## Incoming
### B<n>. <the human's words, verbatim>
- Source: human, <session or gate>, <date>

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
not deleted, so the rejected path stays on record. "Incoming" is empty
after each director pass.

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

An excerpt. The production kept no bible while it was made; this one was
written afterwards from the human's real decisions in the session and
the notes rounds. Full real version:
`D:\code\ai\cognition\production\bible.md` (B1–B22).

```markdown
# Bible: What a Mind Is Made Of

## Incoming

(empty)

## Argument

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

### B5. The thought experiment is ours, not the philosophers'.
- Wording: "Let’s try a thought experiment."
- Reason: invite the viewer in; no appeal to authority.
- Source: human, notes round 1.
- Applies to: zombie.intro.
- Rejected: "Philosophers built a thought experiment for exactly this."

## Voice

### B10. You and the zombie share one voice.
- Reason: the argument made audible. The zombie is you, minus nothing you can hear.
- Source: director proposal, approved by human.
- Applies to: script/cast.ts (zombie = you by reference).

### B12. Every line is cloned from one frozen reference clip per speaker.
- Reason: voice design from a text description rerolls the voice on every
  call. The human heard each line sound slightly different.
- Source: human note (notes round 2); structural fix approved.
- Applies to: script/cast.ts, voice/refs/.

## Structure

### B13. Every chapter ends on its conclusion card. Nothing follows the card.
- Reason: human: an extra panel after a card "breaks the standard of the video".
- Source: human, notes round 1 (form.back after form.claim, now cut).
- Applies to: every chapter. Live breaches are under Open.

## Locks
- Script locked: not recorded. Current cut: 1b6be63, 7:06.2.
- Cast locked: voice/refs/narrator.wav (sha256 aa9356503255…),
  you.wav (ccbc734b79fd…), friend.wav (6a14cd2863e5…),
  aibot.wav (6970c4ff87c3…)
- Animatic signed: none. This video was made before storyboards and
  animatics existed.

## Open
- B13 breach: body.list follows the card body.name. Human: Q5.
- B13 breach: words.cause follows the card words.claim. Human: Q5.
- B13 breach: animals.end (7 s closing hold, no words) follows the last
  card animals.claim. Proposed as an allowed exception. Human: Q5.
- B13 breach: inventory has no card. Human: Q2.
- B1, B2: the ethics step has no reason beat (R3-4 to R3-6). The thesis
  and "trivia" stay either way. Human: Q1.
- The questions are in production/status.md.
```

## Notes on the example

- B3 and B5 exist because of real errors: one relitigation, one human
  rewrite. Most entries come from the notes round. A bible started in
  development would have held B1–B3 before any work began.
- The "Open" section is where structural checks land when they find
  live violations. The B13 test, run on the final script, finds three
  beats after cards: body.list, words.cause, animals.end. It cannot see
  a missing card. The spine checklist finds that one (inventory).
