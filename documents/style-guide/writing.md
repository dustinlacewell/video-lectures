# Writing guide

How the narration and the characters sound on the page. A voice profile
you can measure, and rules. Each rule is backed by a pair: a draft line
and the human's fix.

## Why it exists

Most of the human's notes in the reference production were about
precision of claims and grammar ("particle" → "particles", "a physical
cause" → "physical causes"). Each one was a line the writer could have
got right with a written rule. Without the rules, every new draft
repeats the same class of error and the human pays for it again.

## Owner and flow

- Owner: [director](../../roles/director.md).
- Readers: [writer](../../roles/writer.md),
  [script-editor](../../roles/script-editor.md). Never a
  [cold viewer](../../loops/cold-viewer-review.md).
- New rules come from the [notes-to-checks loop](../../loops/notes-to-checks.md):
  two pairs that show the same move, or one pair where the human states
  the rule. The director writes the rule; the producer adds a line that
  detects a breach to `production/checks/script-editor.md`.
- Writers may propose a rule. They may not change one.

## Where it lives

`production/style-guide/writing.md` in the video repo.

## Format

```markdown
# Writing guide: <video title>

## Voice profile
- Narrator: <who, in a phrase the casting brief can reuse>
- Sentences: mean <n> words, max <n>; share of fragments <n>%
- Pace: <n> spoken words per second of runtime, the narrator rate in production/status.md (plan chapter lengths with it)
- Person: <you / we / they>
- Register: <plain, dry, ...>; humor: <where, how much>
- Characters: <id>: <how they talk>

## Rules
### W<n>. <rule, imperative, one line>
- Detect: <the observable breach the script-editor looks for>
- Pairs:
  - "<draft>" → "<fix>" (<source: notes round, beat id>)
```

## How it is checked

- [Script-editor](../../roles/script-editor.md) runs every "Detect" line
  against each changed beat and cites the beat id and the line.
- Sentence length and fragment share are measured by script, not
  judged: split `say` on sentence ends and count words.
- The human's next notes round is the real test. A note that matches an
  existing rule means the check failed; fix the line in
  `production/checks/script-editor.md`.

## Filled example: "What a Mind Is Made Of"

The drafts are the lines as they stood before the notes round (the port
of the original page). The fixes are the human's. Full real version:
`D:\code\ai\cognition\production\style-guide\writing.md`.

```markdown
# Writing guide: What a Mind Is Made Of

## Voice profile
- Narrator: posh British woman, mid-30s, dry and wry.
- Sentences: mean 6.5 words, max 18. 45 of 114 narrated sentences have
  four words or fewer ("A spirit." "Nothing." "Take a lever.").
- Pace: 1.94 spoken words per second of runtime (826 words in 7:06 on
  the real clips).
- Person: "you" for the viewer. "Let's" when we do something together.
- Register: plain and concrete. An object comes before the abstraction
  (a domino before causal closure, a lever before "form is function").
- Lists are fragments: "Perceiving. Remembering. Wanting. Deciding."
- Humor: understatement inside a plain claim. "A very determined
  thought." "Physicists have tested those laws to absurd precision." "It yelps, hops, and holds a grudge."
- Imperatives to the viewer: "Lift your arm." "Step on its toe." "Now
  check the zombie."
- Characters: friend asks short questions. You and the zombie say the
  same words in the same voice.

## Rules

### W1. State the chapter's claim first, then show it.
- Detect: a chapter's first spoken beat does not state its spine opening claim.
- Pairs:
  - "Now look at what physical things do. Start with a lever." →
    "In a physical world, form and function are the same thing." /
    "The shape a thing has decides what it can do. And what it does
    betrays its shape." / "Take a lever." (form.thesis)

### W2. Get number and agreement exact in every claim.
- Detect: a noun in a claim whose number does not match what it names.
- Pairs:
  - "the same few kinds of particle" → "the same few kinds of particles" (physics.atoms)
  - "So the same rule applies to you." → "So the same rules apply to you." (body.you)
  - "your report of it has a physical cause." → "your report of it has physical causes." (words.cause)

### W3. Scope a claim exactly as far as the argument reaches. No further.
- Detect: a card or claim line stated without the limit the argument
  needs (for ethics, for what you say or do).
- Pairs:
  - "A mind is its cognition." → "For the purposes of ethics, a mind is its cognition." (animals.claim)
  - "Inner experience does none of the work." → "Inner experience cannot
    be responsible for what you say or do." (zombie.claim)

### W4. Inside a thought experiment, stipulate. Never say what a character's own later line contradicts.
- Detect: a line describing a character's inner state that a later line
  by that character denies.
- Pairs:
  - "One difference. The zombie has no inner conscious experience." /
    "There is nothing it is like to be the zombie. No felt redness. No
    felt pain." → "For the sake of the experiment, give it one
    difference: no inner experience. No lights on inside." (zombie.diff)

### W5. Do it with the viewer. Do not cite authority.
- Detect: "philosophers say", "scientists call", "it is called" where the
  video could just do the thing.
- Pairs:
  - "Philosophers built a thought experiment for exactly this." → "Let's try a thought experiment." (zombie.intro)
  - "It is called a zombie. Not the movie kind." → "Imagine a zombie. Not the movie kind." (zombie.movie)

### W6. Cut a metaphor that restates a claim. Cut a second example once the point is made.
- Detect: a figure of speech that needs decoding, or an example that
  shows the same thing as the one before it.
- Pairs:
  - "Marbles and a rocker can add too. The same play, in a different
    performance." / "And each machine can only give the one performance
    its form allows." → cut (form.marble, form.only)

### W7. Characters speak their own lines. The narrator does not quote them.
- Detect: a narrator line with quoted speech, or "someone asks".
- Pairs:
  - "Someone asks: coffee or tea?" → friend: "Coffee or tea?" (words.ask1)
  - "“Coffee.” A physical process selected that word." → you: "Coffee." /
    narrator: "A physical process selected that word." (words.ans1, words.selected)
  - "So ask it. Are you conscious?" → "So let's ask. Hey, are you
    conscious?" then you and the zombie answer together. (zombie.ask, zombie.yes)

### W8. Name the cause the argument depends on.
- Detect: "has to", "must", or "because form is function" where the line
  should say what the cause is.
- Pairs:
  - "It has to say that. Its brain has the same form as yours, and form
    is function." → "The zombie gives the same response you do, for all
    the same physical reasons." (zombie.must)

### W9. Attribute a view together with the consequence it claims.
- Detect: "people ask whether X" with no "as if" or "because".
- Pairs:
  - "People ask whether it is conscious, as if the answer would settle
    how to treat it." → "People ask whether they are conscious, as if
    the answer settles how we ought to treat them." (animals.ask)

### W10. Keep the human's strong words. Say who or what the word is about.
- Detect: a softened or hedged version of a word the bible fixes.
- Pairs:
  - "It is trivia. The answer has no moral or ethical import whatsoever."
    → "Whether a being is conscious is tantamount to trivia. It has no
    moral or ethical import." (animals.trivia)

### W11. Mark the word the voice must stress.
- Detect: a card or line whose claim turns on one word that is not
  marked with *asterisks*.
- Pairs:
  - "Form is function." → "Form *is* function." (form.claim)
```

## Notes on the example

- W2 has three pairs and W7 has three. Those are the rules a checklist
  pays for fastest.
- The profile numbers are measured from `script/*.ts`. A new chapter
  whose mean sentence length is far above 6.5 words reads as a different
  narrator.
