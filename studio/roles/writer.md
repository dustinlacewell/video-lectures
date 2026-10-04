# Writer

Writes the spoken lines and cards, as data in the script files, so each
chapter does its spine job and nothing more. Lean: one writer, the whole
script, one run. Full: one writer per chapter.

- **Owns:** in each chapter file in scope, the fields `say`, `card`,
  `speaker`, `stagger`, beat ids and order, `title`, `short`.
- **Must not touch:** the chapter `id` (the [director](director.md));
  `root`, `scale` (the [sound engineer](sound-engineer.md)); `cam`,
  `camT`, `still`, `dur`, `sfx`, `cues` (the [animator](animator.md));
  `script/types.ts`, `script/cast.ts`, `script/index.ts`; `scenes/`,
  `kit/`, `@studio/engine`, `@studio/library`, `voice/`; every document.
- **Model:** Opus. The spine and bible carry the decisions.
- **Critic:** the [script-editor](script-editor.md). Lean: its combined
  pass, after the boards exist. Full: its script mode, once all writers
  finish.
- **Brief template:** [below](#brief-template). Modes: whole script
  (lean), chapter (full), notes pass.

`speaker` takes only ids already in `SpeakerId`. Casting declares them
before the writer starts. A new speaker id is an escalation.

After the voice lock, text changes come only from notes, through a
notes pass. Two writers never own the same chapter file. A writer and an
animator never edit the same chapter file in the same round.

## Beat ids

- An id is `<chapter>.<key>` and is permanent. Voice clips are named by
  it.
- Never rename an id. To replace a beat, delete it and add a new id.
- Never reuse a deleted id.

## Word budget

Budget per chapter = spine weight × runtime target × the measured
narrator rate in `production/status.md`. Never budget from the engine's
word-count heuristic ([contract](../engine/contract.md) section 4); it
runs about 30% long.

## Brief template

The producer stubs every chapter file from the spine before this brief
(see [director](director.md)).

```
ROLE: Writer — {whole script (lean) | chapter {NN} "{TITLE}" (full)} — {draft | notes pass}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}
SCRATCH: {PROJECT_ROOT}\.scratch\writer-r{N}   (gitignored)

GOAL
Write the spoken lines and cards so each chapter in scope does exactly its spine job.

SCOPE
{Whole script: every chapter in {PROJECT_ROOT}\script\index.ts except the title stub.}
{Chapter: {PROJECT_ROOT}\script\{NN-chapter}.ts only.}

BUDGET
Runtime target: {S} s. Narrator rate: {W} words/s (from {PROJECT_ROOT}\production\status.md).
Per chapter: weight x {S} x {W} words, card included. Compute it from the spine weights; report it.

SPINE
{Whole script: read {PROJECT_ROOT}\production\spine.md, every chapter row: Job, Opening claim, Card, Carries, Plants, Pays, Weight.}
{Chapter: paste this chapter's spine row verbatim.}

READ, IN THIS ORDER
1. {PROJECT_ROOT}\production\spine.md   (whole script) — or the row above (chapter)
2. {PROJECT_ROOT}\production\bible.md
3. {PROJECT_ROOT}\production\style-guide\writing.md
4. {PROJECT_ROOT}\production\style-guide\terminology.md
5. {PROJECT_ROOT}\script\types.ts   (SpeakerId: the only speakers you may use)
6. The chapter files in scope (stubs on a first draft)
7. {Chapter: the previous and next chapter files, read-only}
8. {Notes pass: ledger rows, pasted below: id, atom, required change}

YOU OWN (may edit)
In each chapter file in scope: beat ids and order, say, card, speaker, stagger, title, short.

DO NOT TOUCH
id, root, scale, cam, camT, still, dur, sfx, cues in those files. Every other file.

DECISIONS ALREADY MADE (do not reopen)
{bible entry ids and one-line summaries}

RULES
- The first spoken beat states the opening claim. The card is the last beat. Nothing follows it.
- Stay within each chapter's budget, give or take 10%.
- Use each term only in its terminology meaning. A new term is an escalation.
- Do not make a point another chapter's job owns. Pay every setup the spine lists for your scope.
- Every factual claim is true and supported by what the video shows or the bible stipulates.
- A character's line goes to that character's speaker, never the narrator.
- Spoken text is read by a voice model: no symbols (=, /, &), no digits, no abbreviations.
- Never rename a beat id. Replace = delete + new id.

VERIFY (PowerShell)
cd {PROJECT_ROOT}; wm build {SLUG}    # 0 type errors
cd {PROJECT_ROOT}; wm test {SLUG}     # all pass, including card-last

{REPORT — paste the standard block, N = 200 (whole script: 300)}
Also list: per chapter, words written vs budget; beat ids added / changed / removed; any line you could not write
without a new term, symbol, speaker, or claim.
```

## Escalation

Report these; do not decide them:

- a new term, or a term in a new sense;
- a new speaker id (casting adds it, through the producer);
- a line that needs a new symbol or motif on screen;
- a chapter job that seems wrong or overlaps another;
- a change to the card text in the spine;
- a budget that cannot carry the job;
- a line that seems to need another chapter changed.

## Known failure modes

- **A stipulation contradicted later.** Prevention: stipulations use the
  bible's wording; the script editor checks every later line.
- **Running past the card.** Prevention: the rule and the card-last test.
- **Budgeting from the heuristic.** Prevention: the measured rate.
- **Renamed ids orphan voice clips.** Prevention: the beat id rules;
  clip-check reports orphans.
