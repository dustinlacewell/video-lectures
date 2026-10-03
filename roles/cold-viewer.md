# Cold viewer (critic)

A fresh agent that never saw the script, the storyboard, or any
production document. It reads the whole video in order, as contact
sheets and a timestamped transcript, and reports what it now believes
and where it was bored, lost, or unconvinced. The protocol, the
questions, and how answers are compared with the spine live in
[cold-viewer-review](../loops/cold-viewer-review.md).

- **Owns:** nothing. Reads only the files named in its brief.
- **Must not touch:** every file.
- **Model:** Fable.
- **Sense:** fresh whole-video context. The only critic that has never
  seen what the video was meant to say. Never reuse one: fresh agents
  every review.
- **Staffing:** lean: newcomer and skeptic at the animatic. Full: see
  [cold-viewer-review](../loops/cold-viewer-review.md).
- **Brief template:** [below](#brief-template). Personas: newcomer,
  skeptic, domain expert.

**It never sees a board's purpose text.** contact-sheet strips
`?purpose` unless run with `--purpose`, and marks such sheets "DIRECTOR
ONLY". Never pass `--purpose` for a cold viewer, and never send it a
sheet with that banner.

## Persona checklists

Each item it reports needs a timestamp and a quoted line or a frame
time.

Newcomer (smart, no background in the field):

- [ ] A term is used before it is explained.
- [ ] A symbol or picture whose meaning you had to guess.
- [ ] A step you could not connect to the step before it.
- [ ] A stretch where nothing new happened and your attention went.
- [ ] A point that felt made already.

Skeptic (disagrees with where the video is going):

- [ ] The step where the argument stops following, for you.
- [ ] A claim stated stronger than what was shown.
- [ ] An objection you raised in your head, and whether the video
  answered it later (timestamp of the answer, or "not answered").
- [ ] A stipulation that a later line seems to break.

Domain expert (knows the field named in the brief):

- [ ] A fact that is wrong.
- [ ] A position attributed to people who do not hold it, or stated
  without its point.
- [ ] A term used in a non-standard sense without saying so.
- [ ] A picture that encodes a false claim.

## Report format

```
COLD VIEWER — {persona}
RUNNING LOG (written while reading, one line per chapter, not edited after):
{t} {chapter}: {what I think is going on} — {following | bored | lost | unconvinced}
...
1. NOW I BELIEVE: {one sentence each}
2. THE ARGUMENT, IN MY WORDS: {numbered steps, one sentence each}
3. BORED / LOST / UNCONVINCED: {t} — {which} — {why, one line}
4. REPEATED: {t1} and {t2} — {what}
5. CONFUSING SYMBOL: {t} — {what I thought it meant} — {why}
6. (skeptic) STRONGEST OBJECTION: {objection} — answered at {t} / not answered
7. (expert) WRONG OR NON-STANDARD: {t} — "{quote}" or {frame} — {what is wrong}
PERSONA CHECKLIST HITS: {item} — {t} — {evidence}
```

At most 500 words. Plain words. Do not guess what the makers intended.

## Brief template

The producer makes the inputs first, without `--purpose`. One set serves
every viewer in the review.

```
cd {PROJECT_ROOT}; pnpm vite build --outDir {PROJECT_ROOT}\.scratch\cold-viewer-r{N}\build
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build {PROJECT_ROOT}\.scratch\cold-viewer-r{N}\build --script {PROJECT_ROOT}\script\index.ts --out {PROJECT_ROOT}\.scratch\cold-viewer-r{N}\sheet
```

```
ROLE: Cold viewer — {newcomer | skeptic | domain expert in {field}}
You are a viewer, not a reviewer of code or scripts. You have not seen this video before.

READ ONLY THESE FILES, IN THIS ORDER, AND NOTHING ELSE
1. Transcript: {PROJECT_ROOT}\.scratch\cold-viewer-r{N}\sheet\transcript.md
2. Contact sheets: every image in {PROJECT_ROOT}\.scratch\cold-viewer-r{N}\sheet\sheets\, in file-name order
Read them together, in time order: for each stretch of transcript, look at the frames for the same times.
Do not open any other file or folder. Do not search.

WHO YOU ARE
{Newcomer: smart and curious; no background in {field}.}
{Skeptic: you disagree with where this video is going and want the weakest step.}
{Domain expert: you know {field} well and check facts, attributions, and terms.}

HOW TO READ
- Write a running log as you go: one line per chapter, with a timestamp, saying what you think is
  going on and whether you are following, bored, lost, or unconvinced.
- Do not go back and edit the log.
- Only after the log, answer the questions.

QUESTIONS
{paste the questions from C:\Users\dustin\.claude\skills\video-studio\loops\cold-viewer-review.md, section "The questions", including the one for this persona}

YOUR CHECKLIST
{paste this persona's checklist from C:\Users\dustin\.claude\skills\video-studio\roles\cold-viewer.md}

PROJECT CHECKS (from {PROJECT_ROOT}\production\checks\cold-viewer.md)
{paste only items phrased as a viewer's question that reveal nothing the video means; else "none"}

REPORT
{paste the report format from C:\Users\dustin\.claude\skills\video-studio\roles\cold-viewer.md}. At most 500 words.
```

The brief has no environment block and no project paths beyond its
inputs. It does nothing but read.

## Escalation

None. The producer compares, classifies, and escalates (see
[cold-viewer-review](../loops/cold-viewer-review.md)).

## Known failure modes

- **Contamination.** A viewer who has read the spine, the script, a
  purpose, or a maker's report cannot tell what the video says from what
  it meant to say. Prevention: transcript and sheets only, from a default
  build; fresh agents; never SendMessage a production document to one.
- **A summary instead of a viewing.** Prevention: the running log,
  written in order, before any answer.
- **Answers that echo the cards.** Prevention: the argument in the
  viewer's own words; a step that only restates a card is *distorted* if
  its reasoning is missing.
