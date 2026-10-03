# Cold-viewer review

Fresh agents that never saw the script consume the whole video in order
and say what they now believe. The producer compares that against the
[spine](../documents/spine.md). The gap between what the video was meant
to argue and what a viewer took away is the finding.

## Why it exists

Chapter teams see one chapter. Nobody on a chapter team can see that
three chapters make the same point. On the reference production, the
original video made one point three times across chapters 4–6. Only a
reader of the whole video, in order, notices that.

A cold viewer also shows which objections the video fails to answer. If
a skeptic raises an objection the video answers, the answer did not
land.

## When it runs

1. **At the animatic.** Before the human's main sign-off. Fixes are cheap here.
2. **At the final cut.** Before delivery.

Each run uses three new agents: newcomer, skeptic, domain expert. The
lean track uses two: newcomer and skeptic. Never reuse a cold viewer
from an earlier run.

## The rule: cold viewers never read production documents

A cold viewer reads nothing under `production/`: not the spine, bible,
storyboard, style guide, terminology, visual vocabulary, notes ledger or
project checks. Not the script source either. No document lists the
cold viewer as a reader. Once it has seen any of them, it is no longer
cold, and its run is void: spawn a new agent.

The same holds for what is drawn on the frames. The board renderer's
purpose band states each beat's intended belief, so cold-viewer contact
sheets are captured without `?purpose`
([animatic](../documents/animatic.md)).

## Inputs

Both come from [contact-sheet](../tools/contact-sheet.md), run on the
current build (at the animatic: `?boards`, never `?purpose`):

- **Contact sheet.** Keyframe images in time order, with time and chapter
  on each.
- **Timestamped transcript.** Every spoken line and card, with its start
  time and speaker, in order.

The agents get file paths, nothing else. No summary, no title card
explanation, no "this video argues that...".

## Personas

| Persona | Who they are | What they watch for |
|---|---|---|
| Newcomer | Smart, curious, no philosophy or neuroscience background | Jargon used before it is explained; symbols they cannot read; steps that skip; where they stop following |
| Skeptic | Disagrees with the thesis and wants to find the weak step | The step where the argument does not follow; objections the video should answer; claims stated stronger than shown |
| Domain expert | Knows the field (for the reference video: philosophy of mind and cognitive science) | Wrong facts; misattributed positions; terms used in a non-standard sense; pictures that encode false claims (e.g. showing animals as unsure self-modelers) |

Pick the domain for the expert from the bible's thesis. Use
[cold-viewer](../roles/cold-viewer.md) for the brief.

## The questions

Each cold viewer first reads in order and writes a running log: one line
per chapter, with a timestamp, saying what it thinks is going on and how
it feels (following, bored, lost, unconvinced). It writes the log before
it answers anything below. It does not go back to edit the log.

Then it answers, in this order:

1. **What do you now believe** that you did not believe, or had not
   thought about, before? List each belief as one sentence.
2. **State the argument in your own words.** Number the steps. Keep each
   step one sentence.
3. **Where were you bored, lost, or unconvinced?** Give the timestamp and
   one line of why for each.
4. **What felt repeated?** Give both timestamps for each repeat.
5. **Which symbol or picture confused you?** Give the timestamp, what you
   thought it meant, and why.
6. (Skeptic only) **What is your strongest objection, and did the video
   answer it?** If yes, give the timestamp of the answer.
7. (Expert only) **What is wrong or non-standard?** Quote the line or
   name the frame.

## Comparing answers against the spine

The producer spawns one Fable synthesis agent for this step. Its explicit
inputs: the spine, the bible, the visual vocabulary, the cold-viewer
reports, the timestamped transcript, and `__info()` output (beats with
start times and ids). It does not read code. This step is not optional.
When cold-viewer findings reach a notes round without it, run it first.

It produces:

- **Argument match.** For each spine chapter job, does each persona's
  step list contain it? Mark *present*, *missing*, or *distorted* (stated
  wrongly). A step that only repeats a card's words, with no reason
  behind it, counts as *distorted*: cards state each conclusion, so a
  viewer can list them without following the argument. Also list
  *extra* beliefs: things a viewer took away that no spine job intends.
- **Belief match.** Compare answer 1 against the spine's thesis. A viewer
  who cannot state the thesis is a blocking finding.
- **Hot spots.** Map every bored, lost, unconvinced, repeated, or confused
  timestamp to a beat id. Rank them by the convergence rule below.
- **Unlanded answers.** A skeptic objection the script answers (cite the
  beat id), where the skeptic said it was not answered, is blocking.
- **Symbol confusion.** Each confused symbol, with its visual-vocabulary
  row (or "no row": an unlisted symbol).
- **Bible attacks.** Each finding that says a bible entry is wrong,
  with the entry id.

Skeptic disagreement alone is not a defect. The skeptic may stay
unconvinced. The defect is a step the skeptic could not follow, or an
answer the skeptic did not see.

## The convergence rule

- **Two or more personas, independently.** A finding raised by two or
  more personas about the same beats is a priority note. The personas
  never saw each other's reports, so agreement is strong evidence.
- **One persona.** Weigh the finding by that persona's job. A newcomer
  lost at a term is a clarity defect. A skeptic's unanswered objection
  is a step that did not follow. An expert's "non-standard" is a fact
  or framing question for the human. A newcomer's view of the field, or
  an expert's boredom, weighs little.

The synthesis lists priority notes first. The producer brings them to
the human. The skill does not judge the thesis: the human owns the
argument, and the bible records it.

## Worked example: a real run on the reference video

Three Fable cold viewers (newcomer, skeptic, expert in philosophy of
mind) on the final cut of "What a Mind Is Made Of", runtime 7:06. Inputs:
the timestamped transcript and 26 contact-sheet PNGs. Nothing else.

Converging findings (two or more personas, independently):

1. **Inventory repeats zombie.** All three. The inventory chapter
   (4:36–5:28) makes the zombie chapter's point again. The trait list is
   read two or three times (4:44, 5:18, 5:48).
2. **"No moral or ethical import" (6:35) is not argued.** All three.
   The skeptic: the video showed experience is causally idle, not that
   it is worthless; "pain hurts, and hurting is bad regardless of what
   it causes" is not answered. The expert: sentientism (Bentham, Singer)
   is mainstream, and the video dismisses it without stating it.
3. **The zombie stipulation assumes the disputed point.** Two: newcomer
   and expert. "Give it one difference: no inner experience" (3:55). The
   newcomer: "if form is function, how can a same-form copy differ at
   all?" The expert: under physicalism the zombie is impossible; the card
   at 4:28 follows only on property dualism.

Single-persona findings, a few of them:

- Newcomer: the XOR/AND/"ones"/"twos" labels at 1:37 are never
  explained.
- Skeptic: the ghost test (0:31) is a joke, not evidence. The script
  gives the evidence earlier, at `physics.laws` (0:14). That is an
  unlanded answer, so it is blocking.
- Expert: the "?" on the AI's self-model (6:51) reads as ranking the AI
  lowest, while the narration says "the same is true of AI".

Findings 2 and 3 attack bible entries (B2 the "trivia" wording, B4 the
stipulation). They go to the human as questions. No line will make a
committed skeptic agree. The fix the producer can recommend is to argue
the step, never to change the claim.

One finding failed the evidence check. "'Yes. Obviously. I am
experiencing this right now.' heard three times (3:13, 4:05, and once
more)." The transcript has two. The third has no timestamp. The
planned pair is bible B10 and B11. The row closed as settled.

## From findings to notes

Every blocking finding and every note goes into the
[notes ledger](../documents/notes-ledger.md) as a row, its Note column
prefixed `cold-viewer/<persona>:` (or `cold-viewer/all:`). Then each one
runs through [notes-to-checks](notes-to-checks.md), the same as a human
note.

**Verify a finding on the frame before routing it.** A cold viewer's
timestamp, or a tool's guess at a cause, is a claim. Open the frame or
the transcript line at that time first. A finding the evidence does not
show is dropped, as in the worked example above.

**A finding that attacks a bible entry goes to the human as a
question.** The team never fixes against the entry and never drops the
finding. A converging attack, or an expert naming a fact or a standard
view, gets its own question. Single-persona attacks go together in one
question: "keep these entries?", with the producer's recommendation.

The producer shows the human a short summary at the gate: the thesis
match, the top three hot spots, and one recommendation. Not the raw reports.

Typical fixes by finding:

- Missing or distorted chapter job → script fix in that chapter, or a
  spine change (director, then human).
- Repeat across chapters → cut one instance; the spine records which
  chapter owns the point.
- Lost at a term → define the term at first use; terminology table entry.
- Confused symbol → visual-vocabulary entry or a different symbol (art
  director, then human).
- Bored → check the [pacing curve](../tools/pacing-curve.md) at that
  beat; trim or add a visual change.
