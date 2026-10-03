# Bible: What a Mind Is Made Of

## Incoming

(empty)

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
- Wording: "Let’s try a thought experiment."
- Reason: invite the viewer in; no appeal to authority.
- Source: human, notes round 1.
- Applies to: zombie.intro.
- Rejected: "Philosophers built a thought experiment for exactly this."

### B6. Animals clearly model themselves. Only the AI is uncertain.
- Reason: a dog knows its body, a crow grooms, an octopus never tangles itself.
- Source: human, notes round 1.
- Applies to: animals.matters self-model icons.

### B7. Final card.
- Wording: "For the purposes of ethics, a mind is its cognition."
- Source: human, notes round 1.
- Applies to: animals.claim.
- Rejected: "A mind is its cognition." (claims more than the argument shows)

## Voice

### B8. Narrator: posh British woman, mid-30s, dry and wry.
- Source: human picked from voice-design samples.
- Applies to: voice/refs/narrator.wav.

### B9. Characters have their own cartoon voices. The narrator never voices a character.
- Source: human. The bean voice is "chipper".
- Applies to: script/cast.ts.

### B10. You and the zombie share one voice.
- Reason: the argument made audible. The zombie is you, minus nothing you can hear.
- Source: director proposal, approved by human.
- Applies to: script/cast.ts (zombie = you by reference).

### B11. When several speakers answer together, each gets its own clip, slightly offset.
- Reason: one clip of two voices sounds fake.
- Source: human. Default stagger 0.15 s; zombie.yes uses 0.25 s.
- Applies to: script/types.ts `stagger`; zombie.yes.

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

### B14. Cards are narrated.
- Reason: silent cards felt like dead air in a narrated video.
- Source: human.
- Applies to: every card beat.

### B15. The form chapter opens with its thesis.
- Wording: "In a physical world, form and function are the same thing."
- Source: human, notes round 1.
- Applies to: form.thesis.

## Visuals

### B16. The spirit, not the ghost, tries to reach into the brain.
- Source: human, notes round 1.
- Applies to: body.nogap.

### B17. The brain always shows background activity.
- Reason: without it, "those fired because others fired first" begs the question.
- Source: human, notes round 1.
- Applies to: body.brain, body.trace.

### B18. Saw, learned, wanted: one neuron each.
- Source: human, notes round 1.
- Applies to: body.trace.

### B19. A "Thought experiment" tag stays on screen from zombie.intro to the end of subtract.
- Source: human, notes round 1.
- Applies to: scenes/05-zombie.ts, 06-inventory.ts, 07-subtract.ts (`thoughtTag`).

### B20. The consciousness star shows above the person in animals.
- Source: human, notes round 1.
- Applies to: animals.ask onward.

## Pipeline

### B21. Deliver an interactive web page and an MP4.
- Source: human.

### B22. TTS: Breeze TTS 2.
- Reason: top open-weights model on the Artificial Analysis arena at the time.
- Source: human ("highest benchmarked open model").
- Note: non-commercial license. Fine while the channel is unmonetized.
  Monetizing reopens this entry.

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
- B4: the stipulation reads against the form card (R3-7, R3-8). The
  wording stays either way. Human: Q3.
- B15 and the form card: "Form *is* function" claims both directions
  (R3-18). Human: Q4.
- The questions are in production/status.md.
