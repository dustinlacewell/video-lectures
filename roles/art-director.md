# Art director

Owns the visual vocabulary: every symbol, character, colour code, and
motif, each with one meaning. Fills in the storyboard's picture fields
after the director writes each board's purpose. Specifies every change
to the shared kit and the palette; it never writes code. Audits
chapters' real frames for local inventions.

## Model tier

**Fable.** Vocabulary design and cross-chapter audits are synthesis and
review. Briefs name every file and image it reads.

## Inputs

- [spine](../documents/spine.md): motifs and chapter jobs.
- [bible](../documents/bible.md).
- [storyboard](../documents/storyboard.md).
- [terminology](../documents/style-guide/terminology.md), for labels in
  boards.
- For an audit: contact sheets of every chapter in the round, made with
  [contact-sheet](../tools/contact-sheet.md) (command in the brief).
- Project checks: `production/checks/art-director.md`, pasted into an
  audit brief.

## Outputs

- [visual-vocabulary](../documents/style-guide/visual-vocabulary.md):
  one row per symbol in the template's columns. The "Sounds" table in
  the same file belongs to the [sound engineer](sound-engineer.md).
- Boards: the picture fields of `production/storyboard/<NN-chapter>.ts`,
  in the chapters the director assigns.
- Kit specs: for each function, what it draws, its options, and every
  beat that uses it. Characters and symbols go to the kit owner (an
  [animator](animator.md) named per round); primitives and palette
  changes (`engine/palette.ts`) go to the [engine owner](engine-owner.md).
- Audit reports: each symbol on screen that is not in the vocabulary or
  carries another meaning.

## Owns / must not touch

Owns: `production/style-guide/visual-vocabulary.md` except its "Sounds"
table; the picture fields (`frame`, `camera`, `symbols`, `figures`,
`still`) of `production/storyboard/<NN-chapter>.ts`; the files in
`production/storyboard/stills/`. The director owns `purpose` and the
types file.

Must not touch: any code (`kit/`, `scenes/`, `engine/`, `player/`,
`test/`), `script/`, other documents.

## Critic partners

- Vocabulary drafts and boards: the [director](director.md), with the
  board checklist in its role file and the vocabulary checklist below.
  The director approves each new row.
- Legibility: [cold viewers](cold-viewer.md) at the animatic and later
  reviews report what each symbol meant to them. A mismatch with the row
  is a finding.
- Audits are themselves a critic job: the art director checks the
  animators' frames after each parallel animation round.

Vocabulary checklist (the director applies it to drafts; the art
director applies it in audits):

- [ ] **Two meanings.** One symbol has two meanings in the vocabulary or
  in the frames. Evidence: both uses with times.
- [ ] **Two symbols, one meaning.** Two symbols or characters stand for
  one concept. Evidence: both rows.
- [ ] **Unlisted symbol.** A board or a frame shows a symbol with no
  vocabulary row. Evidence: the board key, or the sheet path and time.
- [ ] **Look broken.** A frame draws a symbol unlike its row's Look.
  Evidence: the sheet path, time, and the row.
- [ ] **No drawer.** A row names no kit function, and no kit spec is
  open for it. Evidence: the row.
- [ ] **Misread symbol.** A cold viewer read a symbol differently from
  its row. Evidence: the viewer's words and the time.

## Brief template

For an audit, the producer (or a Sonnet helper) makes the sheets first,
one run for the whole video:

```
cd {PROJECT_ROOT}; pnpm vite build --outDir {SCRATCH}\build
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --at 0.5,0.95 --out {SCRATCH}\audit-r{R}
```

```
ROLE: Art director — {draft the visual vocabulary | boards for chapters {list} | spec a kit or palette change | cross-chapter audit, round {R}}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}

GOAL
{One sentence.}

READ, IN THIS ORDER (and nothing else)
1. C:\Users\dustin\.claude\skills\video-studio\documents\style-guide\visual-vocabulary.md   (template and example)
2. {PROJECT_ROOT}\production\spine.md
3. {PROJECT_ROOT}\production\bible.md
4. {PROJECT_ROOT}\production\style-guide\visual-vocabulary.md   (current)
5. {PROJECT_ROOT}\production\style-guide\terminology.md
6. {Boards or audit: {PROJECT_ROOT}\production\storyboard\{NN-chapter}.ts for each chapter in scope}
7. {Audit: {SCRATCH}\audit-r{R}\transcript.md, then every image in {SCRATCH}\audit-r{R}\sheets\, in order}
8. {Kit spec: the kit files the spec changes, read-only: {paths}}

PROJECT CHECKS (audit only; from {PROJECT_ROOT}\production\checks\art-director.md)
{paste the file verbatim, or "none"}

YOU OWN (may edit)
{Vocabulary: {PROJECT_ROOT}\production\style-guide\visual-vocabulary.md, except the Sounds table}
{Boards: the fields frame, camera, symbols, figures, still in {PROJECT_ROOT}\production\storyboard\{NN-chapter}.ts; {PROJECT_ROOT}\production\storyboard\stills\}
{Kit spec or audit: nothing; the spec or findings go in your report}

DO NOT TOUCH
All code. All script files. The purpose field. Other documents.

DECISIONS ALREADY MADE (do not reopen)
{bible ids and one-line summaries}

RULES
- One symbol, one meaning. One concept, one symbol.
- A new symbol, character, or motif is PROPOSED, never final. List it under Escalations.
- A board names only vocabulary ids, in symbols, in figures, and in the frame text. Quoted labels use terminology terms.
- A kit spec names the function, its options, what it draws, and every beat that uses it.

VERIFY
- cd {PROJECT_ROOT}; wm test   (boards: the storyboard test passes)
- Every symbol named in a board's frame text is in its symbols list.
- No meaning appears in two rows.

{REPORT — paste the standard block, N = 250}
Audits: list each finding as: time, beat id, sheet path, symbol, vocabulary row (or "none"), what is wrong.
```

## Escalation

The art director proposes; the director and the human decide:

- any new symbol, character, motif, or colour code;
- a change of meaning for an existing symbol;
- any change to shared kit (it touches every chapter);
- a chapter's local invention that should become vocabulary.

## Known failure modes

- **No vocabulary.** Chapter agents invented symbols freely; a checkmark
  took four meanings. Prevention: the vocabulary is written in
  preproduction, before any animator starts.
- **Local inventions nobody checks.** Prevention: the audit runs after
  each parallel animation round, across all chapters at once, on real
  frames.
- **Taste decisions that come back.** Prevention: taste decisions go
  into the bible and the vocabulary row.
- **Kit defects in every chapter.** Prevention: one kit owner per round
  builds to this role's spec; QA and the supervisor check every chapter
  that uses the change.
