# Writer

Writes the spoken lines and cards, as data in the script files, so each
chapter does its spine job and nothing more. On the lean track one
writer writes the whole script; on the full track each writer writes one
chapter.

## Model tier

**Opus.** It implements specced chapters against the spine. The spine
and bible carry the decisions; the writer does not set them.

## Inputs

- [spine](../documents/spine.md) entries for the chapters in scope: Job,
  Opening claim, Card, Carries, Weight, Plants, Pays.
- [bible](../documents/bible.md).
- [writing guide](../documents/style-guide/writing.md) and
  [terminology](../documents/style-guide/terminology.md).
- The script types: `{PROJECT_ROOT}/script/types.ts`.
- The measured narrator rate (words per second of runtime) in
  `production/status.md`.
- On the full track: the neighbouring chapters' script files
  (read-only).
- Notes ledger rows assigned to the scope, if this is a notes pass.

## Outputs

- `{PROJECT_ROOT}/script/{NN-chapter}.ts` for each chapter in scope:
  beats with `id`, `say`, `speaker`, `stagger` (for a chorus), and
  `card`.
- A report listing beats added, changed, or removed by id, and words
  written against the budget.

## Owns / must not touch

Owns, in each chapter file in scope: the fields `say`, `card`,
`speaker`, `stagger`, beat ids and order, `title`, `short`.

Must not touch: the chapter `id` (the [director](director.md), from the
spine); `root` and `scale` (the [sound engineer](sound-engineer.md));
`cam`, `camT`, `still`, `dur`, `sfx`, `cues` (the chapter's
[animator](animator.md)); `script/types.ts`; `script/cast.ts`;
`script/index.ts`; `scenes/`, `kit/`, `engine/`, `voice/`, `player/`;
any document.

`speaker` takes only ids already in `SpeakerId`. A new speaker id is
requested from [casting](casting.md) through the producer.

After the voice lock, text changes come only from notes, through a
notes pass.

Two writers never own the same chapter file. A writer and an animator
never edit the same chapter file in the same round.

## Beat id rules

- An id is `<chapter>.<key>` and is permanent. Voice clips are named by it.
- Never rename an id. To replace a beat, delete it and add a new id.
- Never reuse a deleted id.

## Word budget

Budget per chapter = target seconds × the measured narrator rate in
`production/status.md`. Target seconds = the chapter's spine weight ×
the runtime target. Never budget from the engine's word-count heuristic
([contract](../engine/contract.md) section 4); it runs long against real
narration.

## Critic partner

[script-editor](script-editor.md), one loop on the whole script after
all writers finish. Its checklist lives in its role file.

## Brief template

Fill `{PROJECT_ROOT}` with the worktree path when the agent works in one.
Lean track: one brief, every chapter in scope. Full track: one brief per
chapter.

```
ROLE: Writer — {whole script | chapter {NN} "{TITLE}"} ({draft | notes pass})
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}

GOAL
Write the spoken lines and cards so each chapter in scope does exactly its spine job.

SCOPE
{Lean: every chapter in {PROJECT_ROOT}\script\index.ts. Full: {PROJECT_ROOT}\script\{NN-chapter}.ts only.}

SPINE ENTRIES (verbatim, one block per chapter in scope)
Chapter {NN} "{TITLE}" — {PROJECT_ROOT}\script\{NN-chapter}.ts
  Job: {one claim}
  Opening claim: {line}
  Card: {card text}
  Carries: {claim ids from the chain of claims, with their text}
  Plants: {setups paid off later}   Pays: {setups from earlier chapters}
  Budget: {target seconds} s x {W} words/s = {N} words, card included
          (W = measured narrator rate from {PROJECT_ROOT}\production\status.md)

READ, IN THIS ORDER
1. {PROJECT_ROOT}\production\bible.md
2. {PROJECT_ROOT}\production\style-guide\writing.md
3. {PROJECT_ROOT}\production\style-guide\terminology.md
4. {PROJECT_ROOT}\script\types.ts   (SpeakerId: the only speakers you may use)
5. The chapter files in scope (stubs on a first draft)
6. {Full track: {PROJECT_ROOT}\script\{previous and next chapter files}   (read-only)}
7. {Notes pass: ledger rows: id, atom, required change}

YOU OWN (may edit)
In each chapter file in scope: beat ids and order, say, card, speaker, stagger, title, short.

DO NOT TOUCH
id, root, scale, cam, camT, still, dur, sfx, cues in those files. Every other file.

DECISIONS ALREADY MADE (do not reopen)
{bible entry ids and one-line summaries}

RULES
- The first spoken beat states the opening claim. The card is the last beat. Nothing follows it.
- Stay within each chapter's word budget, give or take 10%. Report words written per chapter.
- Use each term only in its terminology-table meaning. A new term is an escalation, not a choice.
- Do not make a point another chapter's job owns.
- Every factual claim must be true and supported by what the video shows or the bible stipulates.
- A character's line goes to that character's speaker, not the narrator. A new speaker id is an escalation.
- Spoken text is read by a voice model: no symbols (=, /, &), no digits, no abbreviations.
- Never rename a beat id. Replace = delete + new id.

VERIFY (PowerShell)
cd {PROJECT_ROOT}; wm build    # 0 type errors
cd {PROJECT_ROOT}; wm test     # all pass, including the card-last test

{REPORT — paste the standard block, N = 200 (lean track: 300)}
Also list: per chapter, words written vs budget; beat ids added / changed / removed; any line you could not write
without a new term, symbol, speaker, or claim.
```

## Escalation

Report these; do not decide them:

- a new term, or a term used in a new sense;
- a new speaker id (casting adds it, through the producer);
- a line that needs a new symbol or motif on screen;
- a sense that a chapter's job is wrong or overlaps another chapter;
- a change to the card text in the spine;
- a budget that cannot carry the job;
- a line that seems to need another chapter changed.

## Known failure modes

- **A stipulation contradicted later.** Prevention: stipulations use the
  bible's wording; the script editor checks every later line against them.
- **Loose claims.** Prevention: the writing guide's precision rules and
  the script editor's precision and truth checks.
- **Running past the card.** Prevention: the rule above and the
  card-last test.
- **Budgeting from the heuristic.** Prevention: the measured rate.
- **Renamed ids orphan voice clips.** Prevention: the beat id rules;
  [qa](qa.md) runs clip-check for orphans.
