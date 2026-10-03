# Terminology

One term for one thing. The table fixes each key term's single meaning,
the exact words to use for it, the words not to use, and the beat where
the viewer first meets it.

## Why it exists

An argument video lives on its terms. If "inner experience",
"experience", and "consciousness" drift between lines, a careful viewer
asks whether they are three things. In the reference production, notes
on single words ("particle" → "particles", "a physical cause" →
"physical causes") were a large share of all notes. Several chapter
agents also wrote on-screen labels with no shared list to check against.

## Owner and flow

- Owner: [director](../../roles/director.md).
- Readers: [writer](../../roles/writer.md),
  [script-editor](../../roles/script-editor.md),
  [art-director](../../roles/art-director.md) and
  [animator](../../roles/animator.md) (on-screen labels count).
  Never a [cold viewer](../../loops/cold-viewer-review.md).
- A new term, or a new meaning for an old one, goes up to the director.
  A writer never introduces a key term in a chapter's draft without a
  row here.
- A term the human chose (in the bible) can be changed only by the human.

## Where it lives

`production/style-guide/terminology.md` in the video repo.

## Format

```markdown
# Terminology: <video title>

| Term | Means (one meaning) | Use | Do not use | First met |
|---|---|---|---|---|
| <term> | <definition in plain words> | <exact forms allowed> | <synonyms banned> | <beat id> |

## Allowed variants
- <variant> for <term>: <why; who allowed it>

## Slips
- <beat id>: "<quoted words>" → <the fix> (status)
```

"Use" lists every allowed form, including on-screen labels. "First met"
is the beat where the term is defined or shown; any use before it is a
defect.

## How it is checked

- A script greps every `say` and `card`, plus string literals passed to
  label functions in `scenes/`, for each term in "Do not use". Each hit
  is a slip. This is cheap and exact; run it on every script change.
- [Script-editor](../../roles/script-editor.md): a key term used before
  its "First met" beat; a term used with a second meaning. Evidence: the
  beat id and the quoted line.
- [Cold viewer](../../loops/cold-viewer-review.md), domain-expert
  persona: reports any term it read as two things. It never reads this
  table; the synthesis agent compares its report with the rows.

## Filled example: "What a Mind Is Made Of"

Reconstructed. The production had no terminology table. This one is
built from the final script; the lines it quotes are real.

```markdown
# Terminology: What a Mind Is Made Of

| Term | Means (one meaning) | Use | Do not use | First met |
|---|---|---|---|---|
| inner experience | what it is like, from inside, to be you; the one thing the zombie lacks | "inner experience"; label "inner experience" / "no inner experience" | "experience" alone, "felt", "lights" outside zombie.diff | zombie.diff |
| conscious / consciousness | having inner experience; the same thing, in the everyday words of the question | in the question "Are you conscious?" and in quoted views (animals.ask) | as narration's name for the thing (use "inner experience") | words.ask2 |
| cognition | the physical machinery that perceives, remembers, wants, decides | "cognition" | "cognitive machinery", "mind" (until the last card), "the brain" as a synonym | body.name |
| form | the physical shape and arrangement of a thing | "form", "shape" (equated on the card) | "structure" | form.thesis |
| function | what a thing does | "function", "what it does" | "purpose" | form.thesis |
| physical cause | a push by matter or by a force instruments can measure | "physical causes" | "physical reasons", "physical process" | physics.fall |
| particles | what everything is made of | "particles" (plural) | "atoms", "particle" as a mass noun | physics.atoms |
| zombie | a particle-for-particle copy of you with no inner experience | "zombie"; "philosophical zombie" once, at definition | "copy" after zombie.copy; "twin" outside the chapter title | zombie.movie |
| you | the viewer, and the orange figure on screen; the same person | "you" | "the person", "the human" | physics.atoms |
| being | any creature or system with cognition: person, animal, AI | "being" | "creature" for the AI | animals.trivia |
| mind | the whole minded object; the last card says it is its cognition | title and final card only | any earlier use | title |
| self-model | a mind's model of itself | (none yet) | — | NOT MET: first used at animals.matters |
| trivia | true but without moral or ethical import | "tantamount to trivia"; stamp "TRIVIA" | "unimportant", "irrelevant" (bible B2) | animals.trivia |
| thought experiment | a hypothetical we set up together, inside which stipulations hold | "thought experiment"; tag "Thought experiment" | "philosophers built" (bible B5) | zombie.intro |
| epiphenomenal | the thesis term: caused, but causing nothing | bible and spine only | on screen (never spoken in the script) | — |

## Allowed variants
- "for all the same physical reasons" (zombie.must) for "physical
  causes": the human wrote this line. Keep it. Do not spread "reasons"
  to new lines.
- "machinery" (body.name): the line that introduces the term
  "cognition". Allowed there only.

## Slips
- The video never says that "conscious" and "inner experience" name one
  thing. The only link is a character's answer ("Are you conscious?" →
  "I am experiencing this right now."). → Add the equation once in
  narration, at zombie.diff or words.cause. (director → human)
- subtract.claim: "You are not your consciousness." The chapter says
  "inner experience" in both subtractions (s1a, s2a). The card switches
  term at the moment of the conclusion. → Either "You are not your inner
  experience", or settle the equation above first. (human)
- words.cause: "Whatever else is true of experience" — "experience"
  alone, before "inner experience" is defined. → "inner experience"
  after the equation is planted. (writer)
- words.selected "A physical process selected that word.", physics.fall
  "physical reasons", words.cause "physical causes": three phrases for
  one idea. → "physical causes" in narration. (writer)
- inventory.zwhy: "the same cognitive machinery" → "the same cognition". (writer)
- animals.matters: "how richly it models itself" — a key term with no
  setup and no row. → See spine, known defects. (director)
- Code and comments: kit/spark.ts calls the star "the marker for inner
  experience"; scenes/08-animals.ts calls it "the consciousness star".
  Agents read comments. One name: "the inner-experience star". (art-director)
```

## Notes on the example

- The grep check finds the "physical reasons / process / causes" split
  and "cognitive machinery" in seconds. No agent judgement needed.
- The consciousness / inner-experience slip needs a human decision. The
  table makes the question small: one row, two choices.
